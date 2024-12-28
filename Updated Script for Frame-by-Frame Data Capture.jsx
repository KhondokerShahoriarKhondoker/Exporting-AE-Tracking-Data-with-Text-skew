{
    function exportFrameByFrameData() {
        // Prompt user to save JSON file
        var outputFile = File.saveDialog("Save Frame-by-Frame Data JSON", "*.json");
        if (!outputFile) return;

        var project = app.project;
        if (!project) {
            alert("No project is open.");
            return;
        }

        app.beginUndoGroup("Export Frame-by-Frame Data");

        var transformData = {};
        var comps = project.selection;

        if (comps.length === 0) {
            alert("Please select at least one composition in the Project Panel.");
            return;
        }

        // Iterate through selected compositions
        for (var i = 0; i < comps.length; i++) {
            if (!(comps[i] instanceof CompItem)) continue;
            var comp = comps[i];
            var frameRate = comp.frameRate;
            var duration = comp.duration;
            var numFrames = Math.round(duration * frameRate);

            var compData = [];

            // Process each layer
            for (var j = 1; j <= comp.numLayers; j++) {
                var layer = comp.layer(j);

                if (layer.property("Transform")) {
                    var transform = layer.property("Transform");
                    var layerData = {
                        name: layer.name,
                        frames: []
                    };

                    // Sample each frame
                    for (var frame = 0; frame < numFrames; frame++) {
                        var time = frame / frameRate;

                        // Capture frame data
                        var frameData = {
                            time: time,
                            position: transform.property("Position").valueAtTime(time, false),
                            rotation: transform.property("Rotation").valueAtTime(time, false),
                            scale: transform.property("Scale").valueAtTime(time, false),
                            skew: transform.property("Skew") ? transform.property("Skew").valueAtTime(time, false) : null,
                            skewAxis: transform.property("Skew Axis") ? transform.property("Skew Axis").valueAtTime(time, false) : null,
                            opacity: transform.property("Opacity") ? transform.property("Opacity").valueAtTime(time, false) : null,
                            perspective: null
                        };

                        // Check for Corner Pin effect
                        if (layer.effect) {
                            for (var k = 1; k <= layer.effect.numProperties; k++) {
                                var effect = layer.effect.property(k);
                                if (effect.name === "Corner Pin") {
                                    frameData.perspective = {
                                        upperLeft: effect.property("Upper Left").valueAtTime(time, false),
                                        upperRight: effect.property("Upper Right").valueAtTime(time, false),
                                        lowerLeft: effect.property("Lower Left").valueAtTime(time, false),
                                        lowerRight: effect.property("Lower Right").valueAtTime(time, false)
                                    };
                                }
                            }
                        }

                        layerData.frames.push(frameData);
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
        alert("Frame-by-frame data has been exported successfully!");
    }

    exportFrameByFrameData();
}
