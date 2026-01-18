// 指令小幫手 - Background Service Worker

// 安裝時初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log("指令小幫手已安裝");
});

// 監聽來自 content script 或 popup 的訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_COMMANDS") {
    chrome.storage.local.get(["commands"], (result) => {
      sendResponse({ commands: result.commands || [] });
    });
    return true; // 非同步回應
  }

  if (message.type === "SAVE_COMMANDS") {
    chrome.storage.local.set({ commands: message.commands }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
