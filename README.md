# ChatGPT Bulk Delete · ChatGPT 批量删除

A Chrome and Edge extension for reviewing and deleting multiple ChatGPT conversations. This is an independent beta project. The interface follows your browser language preferences, with Chinese and English available.

一款面向 Chrome 和 Edge 的 ChatGPT 批量删除扩展。支持按标题、日期和项目筛选，勾选后先核对名单，再批量删除普通对话、项目内对话或整个项目。界面随浏览器语言自动切换中英文。当前为独立测试版。

## Watch the 4K demo

https://github.com/user-attachments/assets/738946b2-8fd2-469f-b0b0-2621109756d6

[Download the 4K MP4](https://github.com/BlackMagic02/chatgpt-bulk-delete/releases/download/v0.0.1-beta/chatgpt-bulk-delete-promo-4k.mp4)


## Install the beta

1. Download `chatgpt-bulk-delete-0.0.1-beta.zip` from [Releases](https://github.com/BlackMagic02/chatgpt-bulk-delete/releases) and unzip it.
2. Open `chrome://extensions` or `edge://extensions` and enable Developer mode.
3. Choose **Load unpacked** and select the folder containing `manifest.json`.
4. Open or refresh ChatGPT, then click the extension icon.

## Use

Filter by title, project, or creation date, select the items, and review the list before confirming. The extension has separate views for regular chats, chats inside projects, and whole projects. Deleting a whole project also deletes its conversations, project instructions, and files stored only in that project. Deletion cannot be undone.

Dates depend on the metadata available to the ChatGPT page. The extension stores conversation IDs and creation timestamps locally for date filtering. Its scripts run on `chatgpt.com` and use the site's own controls to delete items. The beta depends on the current ChatGPT interface.

Editable Remotion source is in `promo/`.

## 中文

从 Releases 下载测试版 ZIP，解压后在 Chrome 或 Edge 的扩展管理页开启开发者模式，选择「加载已解压的扩展程序」。扩展支持标题和日期筛选，并提供普通聊天、项目内对话和整个项目三个入口。
