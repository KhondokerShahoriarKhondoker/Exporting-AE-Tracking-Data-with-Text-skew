{
    function exportTransformWithPerspective() {
        // Prompt user to save JSON file
        var outputFile = File.saveDialog("Save Transform Data JSON", "*.json");
        if (!outputFile) return;

        var project = app.project;
        if (!project) {
            alert("No project is open.");
            return;
        }

        app.beginUndoGroup("Export Transform Data with Perspective");

        var transformData = {};
        var comps = project.selection; // Process only selected compositions

        if (comps.length === 0) {
            alert("Please select at least one composition in the Project Panel.");
            return;
        }

        // Iterate over selected compositions
        for (var i = 0; i < comps.length; i++) {
            if (!(comps[i] instanceof CompItem)) continue;
            var comp = comps[i];
            var compData = [];

            for (var j = 1; j <= comp.numLayers; j++) {
                var layer = comp.layer(j);

                if (layer.property("Transform")) {
                    var transform = layer.property("Transform");

                    // Collect keyframe data for core transform properties
                    var layerData = {
                        name: layer.name,
                        position: extractKeyframes(transform.property("Position")),
                        rotation: extractKeyframes(transform.property("Rotation")),
                        scale: extractKeyframes(transform.property("Scale")),
                        skew: transform.property("Skew") ? extractKeyframes(transform.property("Skew")) : null,
                        skewAxis: transform.property("Skew Axis") ? extractKeyframes(transform.property("Skew Axis")) : null,
                        opacity: transform.property("Opacity") ? extractKeyframes(transform.property("Opacity")) : null,
                        perspective: null
                    };

                    // Check for Corner Pin effect or similar
                    if (layer.effect) {
                        for (var k = 1; k <= layer.effect.numProperties; k++) {
                            var effect = layer.effect.property(k);

                            if (effect.name === "Corner Pin") {
                                layerData.perspective = {
                                    upperLeft: extractKeyframes(effect.property("Upper Left")),
                                    upperRight: extractKeyframes(effect.property("Upper Right")),
                                    lowerLeft: extractKeyframes(effect.property("Lower Left")),
                                    lowerRight: extractKeyframes(effect.property("Lower Right"))
                                };
                            }
                        }
                    }

                    compData.push(layerData);
                }
            }

            transformData[comp.name] = compData;
        }

        // Write JSON to file
        var jsonString = JSON.stringify(transformData, null, 4);
        outputFile.open("w");
        outputFile.write(jsonString);
        outputFile.close();

        app.endUndoGroup();
        alert("Transform data has been exported successfully!");
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

    exportTransformWithPerspective();
}
