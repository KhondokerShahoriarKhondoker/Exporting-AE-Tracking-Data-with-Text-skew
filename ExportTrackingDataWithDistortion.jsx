{
    function exportTrackingDataWithDistortion() {
        // Prompt user to save the JSON file
        var outputFile = File.saveDialog("Save Tracking Data JSON", "*.json");
        if (!outputFile) return;

        var project = app.project;
        if (!project) {
            alert("No project is open.");
            return;
        }

        app.beginUndoGroup("Export Tracking Data with Distortion");

        var trackingData = {};
        var comps = project.selection; // Selected compositions only

        if (comps.length === 0) {
            alert("Please select at least one composition in the Project Panel.");
            return;
        }

        // Iterate through selected compositions
        for (var i = 0; i < comps.length; i++) {
            if (!(comps[i] instanceof CompItem)) continue;
            var comp = comps[i];
            var compData = [];

            for (var j = 1; j <= comp.numLayers; j++) {
                var layer = comp.layer(j);

                if (layer.property("Transform")) {
                    var transform = layer.property("Transform");

                    // Extract keyframes for each transformation property
                    var layerData = {
                        name: layer.name,
                        position: extractKeyframes(transform.property("Position")),
                        rotation: extractKeyframes(transform.property("Rotation")),
                        scale: extractKeyframes(transform.property("Scale")),
                        skew: transform.property("Skew") ? extractKeyframes(transform.property("Skew")) : null,
                        skewAxis: transform.property("Skew Axis") ? extractKeyframes(transform.property("Skew Axis")) : null,
                        opacity: transform.property("Opacity") ? extractKeyframes(transform.property("Opacity")) : null,
                    };

                    // Include distortion properties if present
                    if (layer.effect) {
                        var effects = {};
                        for (var k = 1; k <= layer.effect.numProperties; k++) {
                            var effect = layer.effect.property(k);
                            effects[effect.name] = extractKeyframes(effect);
                        }
                        layerData.effects = effects;
                    }

                    compData.push(layerData);
                }
            }

            trackingData[comp.name] = compData;
        }

        // Write the JSON data to file
        var jsonString = JSON.stringify(trackingData, null, 4);
        outputFile.open("w");
        outputFile.write(jsonString);
        outputFile.close();

        app.endUndoGroup();
        alert("Tracking data has been successfully exported to JSON!");
    }

    function extractKeyframes(property) {
        if (!property || !property.isTimeVarying) {
            return property ? [property.value] : null;
        }

        var keyframes = [];
        for (var k = 1; k <= property.numKeys; k++) {
            keyframes.push({
                time: property.keyTime(k),
                value: property.keyValue(k),
                interpolation: {
                    inType: property.keyInInterpolationType(k),
                    outType: property.keyOutInterpolationType(k),
                },
                easing: {
                    inTemporalEase: property.keyInTemporalEase(k),
                    outTemporalEase: property.keyOutTemporalEase(k),
                }
            });
        }
        return keyframes;
    }

    exportTrackingDataWithDistortion();
}
