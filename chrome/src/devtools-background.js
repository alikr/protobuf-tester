var panelShow = false;
chrome.devtools.inspectedWindow.eval(
    '!!window',
    function() {
        chrome.devtools.panels.create(
            'ProtoBuf', 'icons/128.png', 'devtools.html',
            panel => {
                // panel loaded
                panel.onShown.addListener(onPanelShown)
                panel.onHidden.addListener(onPanelHidden)
            }
        );
});
chrome.devtools.network.onRequestFinished.addListener(
    function (request) {
        let info = {
            source: 'network',
            networkInfo: null,
            response: null,
            harlog: true,
        }
        // chrome.devtools.network.getHAR(function (harlog) {
        //     info.harlog = harlog;
        //     sendNetWork(info);
        //     // chrome.devtools.inspectedWindow.eval('console.log(' + JSON.stringify(harlog) + ')');
        // });
        request.getContent(function (response) {
            if (request.response.content.mimeType === 'application/x-protobuf') {
                info.networkInfo = request;
                info.response = response;
                sendNetWork(info);
            }
        });
        // chrome.devtools.inspectedWindow.eval('console.log(' + JSON.stringify(request.request) + ')');
        // chrome.devtools.inspectedWindow.eval('window.__PROTOBUF_HOOK__.emit("request",' + JSON.stringify(request.request) + ')');
    }
);

function sendNetWork(info) {
    if (info.networkInfo && info.harlog && panelShow) {
        chrome.runtime.sendMessage(info);
    }
}

function onPanelShown() {
    panelShow = true;
}

function onPanelHidden() {
    panelShow = false;
}