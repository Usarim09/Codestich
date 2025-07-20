chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'saveSnippet') {
    chrome.storage.local.get(['snippets'], (result) => {
      const snippets = result.snippets || {};
      const hash = btoa(request.snippet.code).substring(0, 10);
      if (!snippets[hash]) {
        snippets[hash] = request.snippet;
        chrome.storage.local.set({ snippets });
      }
      sendResponse({ success: true });
    });
    return true;
  } else if (request.type === 'deleteSnippet') {
    chrome.storage.local.get(['snippets'], (result) => {
      const snippets = result.snippets || {};
      delete snippets[request.hash];
      chrome.storage.local.set({ snippets }, () => sendResponse({ success: true }));
    });
    return true;
  } else if (request.type === 'updateNote') {
    chrome.storage.local.get(['snippets'], (result) => {
      const snippets = result.snippets || {};
      if (snippets[request.hash]) {
        snippets[request.hash].notes = request.notes;
        chrome.storage.local.set({ snippets }, () => sendResponse({ success: true }));
      }
    });
    return true;
  }
});