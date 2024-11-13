chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture") {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
    	
    	
    	
      if (chrome.runtime.lastError) {
        sendResponse({success: false, error: chrome.runtime.lastError.message});
      } else {
        sendResponse({success: true, dataUrl: dataUrl});
      }
    });
    return true; // Indicates we wish to send a response asynchronously
  }
});