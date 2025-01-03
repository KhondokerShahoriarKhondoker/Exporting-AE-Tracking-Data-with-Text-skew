{
    function exportTrackingDataToJSON() {
        var outputFile = File.saveDialog("Save Tracking Data JSON", "*.json");
        if (!outputFile) return;

        var project = app.project;
        if (!project) {
            alert("No project is open.");
            return;
        }

        app.beginUndoGroup("Export Tracking Data to JSON");

        var trackingData = {};
        var comps = project.selection; // Export data only for selected compositions

        if (comps.length === 0) {
            alert("Please select at least one composition.");
            return;
        }

        for (var i = 0; i < comps.length; i++) {
            if (!(comps[i] instanceof CompItem)) continue;
            var comp = comps[i];
            var compData = [];

            for (var j = 1; j <= comp.numLayers; j++) {
                var layer = comp.layer(j);

                if (layer.property("Transform")) {
                    var transform = layer.property("Transform");

                    var layerData = {
                        name: layer.name,
                        position: extractKeyframes(transform.property("Position")),
                        rotation: extractKeyframes(transform.property("Rotation")),
                        scale: extractKeyframes(transform.property("Scale")),
                        skew: transform.property("Skew") ? extractKeyframes(transform.property("Skew")) : null,
                        skewAxis: transform.property("Skew Axis") ? extractKeyframes(transform.property("Skew Axis")) : null,
                    };

                    compData.push(layerData);
                }
            }

            trackingData[comp.name] = compData;
        }

        var jsonString = JSON.stringify(trackingData, null, 4);
        outputFile.open("w");
        outputFile.write(jsonString);
        outputFile.close();

        app.endUndoGroup();
        alert("Tracking data has been exported successfully!");
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
            });
        }

        return keyframes;
    }

    exportTrackingDataToJSON();
}
