chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (!tab.url || new URL(tab.url).origin !== "https://chatgpt.com") {
      await chrome.action.setBadgeText({tabId: tab.id, text: "GPT"});
      await chrome.action.setTitle({tabId: tab.id, title: chrome.i18n.getMessage("openChatGPT")});
      return;
    }
    await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ["panel.js"]});
  } catch (error) {
    console.warn("Could not open the bulk delete panel", error);
  }
});
