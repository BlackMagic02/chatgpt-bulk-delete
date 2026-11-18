chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (!tab.url || new URL(tab.url).origin !== "https://chatgpt.com") {
      await chrome.action.setBadgeText({tabId: tab.id, text: "GPT"});
      await chrome.action.setTitle({tabId: tab.id, title: "请在 chatgpt.com 网页中打开扩展"});
      return;
    }
    await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ["panel.js"]});
  } catch (error) {
    console.warn("无法打开对话管理面板", error);
  }
});
