chrome.tabs.onUpdated.addListener(function (id, info, tab) {
    /**
     * below code will trigger the function in content script if our page is visited
     */
    if (tab.url.includes("https://people.zoho.com/visualbisolutions/zp#attendance/entry/listview")) {
        chrome.tabs.sendMessage(tab.id, {args: "test"}, function(response) {
          });
}
})



