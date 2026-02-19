(function(window, undefined) {

    var lastTimestamp = 0;

    window.Asc.plugin.init = function() {
        console.log("[ComplianceSearch] Plugin initialized");

        // Poll localStorage for search commands from the relay page.
        // Both the relay and this plugin are on the OnlyOffice origin,
        // so they share localStorage.
        setInterval(function() {
            try {
                var raw = localStorage.getItem('compliance_search');
                if (!raw) return;

                var cmd = JSON.parse(raw);
                if (!cmd.timestamp || cmd.timestamp <= lastTimestamp) return;

                // New command found
                lastTimestamp = cmd.timestamp;
                console.log("[ComplianceSearch] New search command:", cmd);

                searchAndSelect(cmd.text, cmd.severity || 'medium');
            } catch(e) {
                // Ignore parse errors
            }
        }, 300); // Check every 300ms

        console.log("[ComplianceSearch] Polling localStorage every 300ms");
    };

    window.Asc.plugin.button = function(id) {};

    function searchAndSelect(text, severity) {
        if (!text) return;

        var searchText = text.replace(/\s+/g, ' ').trim();
        if (searchText.length > 50) searchText = searchText.substring(0, 50);

        console.log("[ComplianceSearch] Searching for:", searchText);

        Asc.scope.searchText = searchText;
        Asc.scope.severity = severity;

        window.Asc.plugin.callCommand(function() {
            var text = Asc.scope.searchText;
            var severity = Asc.scope.severity;
            var oDocument = Api.GetDocument();

            var oRange = oDocument.Search(text, false);

            if (oRange && oRange.length > 0) {
                oRange[0].Select();

                var colors = {
                    "high":     [255, 82, 82],
                    "critical": [255, 82, 82],
                    "medium":   [255, 171, 64],
                    "low":      [255, 241, 118],
                    "info":     [144, 202, 249]
                };
                var rgb = colors[severity] || colors["medium"];

                try {
                    oRange[0].SetHighlight(rgb[0], rgb[1], rgb[2]);
                } catch(e) {
                    try { oRange[0].SetHighlight("yellow"); } catch(e2) {}
                }

                return JSON.stringify({ success: true, found: oRange.length });
            }

            // Fallback: shorter snippet
            if (text.length > 20) {
                var shorter = text.substring(0, 20);
                var oRange2 = oDocument.Search(shorter, false);
                if (oRange2 && oRange2.length > 0) {
                    oRange2[0].Select();
                    return JSON.stringify({ success: true, found: oRange2.length, partial: true });
                }
            }

            return JSON.stringify({ success: false });
        }, false, false, function(result) {
            try {
                var res = JSON.parse(result);
                if (res.success) {
                    console.log("[ComplianceSearch] Found and scrolled to text" +
                        (res.partial ? " (partial match)" : "") +
                        ", matches: " + res.found);
                } else {
                    console.log("[ComplianceSearch] Text not found in document");
                }
            } catch(e) {
                console.log("[ComplianceSearch] Result:", result);
            }
        });
    }

})(window);
