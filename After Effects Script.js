{
    function exportCustomJSON() {
        // Prompt user to save JSON file
        var outputFile = File.saveDialog("Save Animation JSON", "*.json");
        if (!outputFile) return;

        var project = app.project;
        if (!project) {
            alert("No project is open.");
            return;
        }

        app.beginUndoGroup("Export Animation JSON");

        var animationData = {
            v: "5.9.0",
            fr: null,
            ip: 0,
            op: null,
            w: null,
            h: null,
            nm: null,
            ddd: 0,
            assets: []
        };

        var comps = project.selection;

        if (comps.length === 0) {
            alert("Please select a composition in the Project Panel.");
            return;
        }

        var comp = comps[0];
        if (!(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        // Populate composition metadata
        animationData.fr = comp.frameRate;
        animationData.op = Math.round(comp.duration * comp.frameRate); // Total frames
        animationData.w = comp.width;
        animationData.h = comp.height;
        animationData.nm = comp.name;

        // Process assets
        for (var j = 1; j <= comp.numLayers; j++) {
            var layer = comp.layer(j);

            if (layer.source && layer.source instanceof FootageItem) {
                // Handle image asset (Base64-encoded)
                var assetData = {
                    id: `imgSeq_${j - 1}`,
                    w: layer.source.width,
                    h: layer.source.height,
                    t: "seq",
                    u: "",
                    p: `data:memix-charli-damelio-poster/gif;base64,${getBase64FromFootage(layer.source)}`
                };
                animationData.assets.push(assetData);
            }
        }

        // Write JSON file
        var jsonString = JSON.stringify(animationData, null, 4);
        outputFile.open("w");
        outputFile.write(jsonString);
        outputFile.close();

        app.endUndoGroup();
        alert("Animation JSON exported successfully!");
    }

    function getBase64FromFootage(footage) {
        // This function simulates Base64 encoding of footage.
        // Replace with real implementation as needed.
        return "/9j/4AAQSkZJRgABAQAAAQABAAD/..."; // Placeholder
    }

    exportCustomJSON();
}
