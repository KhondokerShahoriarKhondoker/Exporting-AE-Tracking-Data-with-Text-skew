// Function to get tracking data (position, rotation, scale, skew) from a layer's keyframes
function getTrackingData(layer) {
    var trackingData = [];
    
    // Check if the layer has position, rotation, scale, and skew properties
    var positionProperty = layer.transform.position;
    var rotationProperty = layer.transform.rotation;
    var scaleProperty = layer.transform.scale;
    var skewProperty = null;

    // Skew might be part of a custom effect or the transform group
    // For layers with text, skew can be part of 'skew' in 'Text' properties (if used)
    if (layer.property("ADBE Text Properties")) {
        var textSkew = layer.property("ADBE Text Properties").property("ADBE Text Transform").property("ADBE Text Skew");
        if (textSkew) {
            skewProperty = textSkew;
        }
    }

    // Ensure there are keyframes for position, rotation, scale, and skew
    if (positionProperty.numKeys > 0) {
        for (var i = 1; i <= positionProperty.numKeys; i++) {
            var keyTime = positionProperty.keyTime(i);
            var keyValue = positionProperty.keyValue(i);
            trackingData.push({
                time: keyTime,
                position: { x: keyValue[0], y: keyValue[1] }
            });
        }
    }
    
    if (rotationProperty.numKeys > 0) {
        for (var j = 1; j <= rotationProperty.numKeys; j++) {
            var keyTime = rotationProperty.keyTime(j);
            var keyValue = rotationProperty.keyValue(j);
            trackingData.push({
                time: keyTime,
                rotation: keyValue
            });
        }
    }
    
    if (scaleProperty.numKeys > 0) {
        for (var k = 1; k <= scaleProperty.numKeys; k++) {
            var keyTime = scaleProperty.keyTime(k);
            var keyValue = scaleProperty.keyValue(k);
            trackingData.push({
                time: keyTime,
                scale: { x: keyValue[0], y: keyValue[1] }
            });
        }
    }
    
    // Skew/Distortion
    if (skewProperty && skewProperty.numKeys > 0) {
        for (var l = 1; l <= skewProperty.numKeys; l++) {
            var keyTime = skewProperty.keyTime(l);
            var keyValue = skewProperty.keyValue(l);
            trackingData.push({
                time: keyTime,
                skew: keyValue
            });
        }
    }

    return trackingData;
}

// Function to export the tracking data to a JSON file
function exportTrackingDataToJSON() {
    var selectedLayers = app.project.activeItem.selectedLayers;

    if (selectedLayers.length == 0) {
        alert("Please select a layer.");
        return;
    }

    var allTrackingData = [];

    app.beginUndoGroup("Export Tracking Data");

    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        var layerData = {
            layerName: layer.name,
            trackingData: getTrackingData(layer)
        };
        allTrackingData.push(layerData);
    }

    // Convert the collected data to a JSON string
    var jsonString = JSON.stringify(allTrackingData, null, 4);

    // Ask the user where to save the JSON file
    var saveFile = File.saveDialog("Save Tracking Data as JSON", "*.json");

    if (saveFile) {
        saveFile.open("w");
        saveFile.write(jsonString);
        saveFile.close();
        alert("Tracking data has been exported successfully.");
    }

    app.endUndoGroup();
}

// Run the export function
exportTrackingDataToJSON();
