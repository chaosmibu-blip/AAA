# Safari Extension 建立指南

## 概述

Safari Extension 需要在 Mac 上使用 Xcode 來建立。好消息是，核心的 JavaScript 和 CSS 代碼可以直接從 Chrome Extension 共用。

## 前置需求

- Mac 電腦
- Xcode 14 或更新版本
- Apple Developer 帳號（免費或付費）

## 建立步驟

### 1. 在 Xcode 建立新專案

1. 打開 Xcode
2. File → New → Project
3. 選擇 **Safari Extension App**
4. 填寫資訊：
   - Product Name: `指令小幫手`
   - Team: 選擇你的開發者帳號
   - Organization Identifier: `com.yourname.commandhelper`
   - Language: Swift
   - 勾選 **Include Configuration App**

### 2. 複製共用代碼

將以下檔案從 `extension/` 複製到 Safari Extension 的 Resources 資料夾：

```
extension/
├── content.js      → Resources/content.js
├── content.css     → Resources/content.css
└── icons/          → Resources/images/
```

### 3. 修改 manifest.json

Safari Extension 使用不同的 manifest 格式，在 Resources 資料夾創建：

```json
{
  "manifest_version": 2,
  "default_locale": "en",
  "name": "指令小幫手",
  "description": "快速複製常用指令的懸浮球工具",
  "version": "1.0.0",
  "icons": {
    "48": "images/icon-48.png",
    "96": "images/icon-96.png",
    "128": "images/icon-128.png"
  },
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "content_scripts": [
    {
      "js": ["content.js"],
      "css": ["content.css"],
      "matches": ["*://*/*"]
    }
  ],
  "permissions": ["storage"]
}
```

### 4. 修改 background.js

Safari 使用 `browser` API 而非 `chrome` API，需要做相容處理：

```javascript
// 在 background.js 開頭加入
const browser = window.browser || window.chrome;
```

### 5. 修改 content.js

同樣需要加入相容處理：

```javascript
// 在 content.js 開頭加入（IIFE 內部）
const browser = window.browser || window.chrome;

// 將所有 chrome.storage 改為 browser.storage
```

### 6. 建置和測試

1. 在 Xcode 選擇目標裝置（Mac 或 iOS Simulator）
2. 按 Cmd+R 執行
3. 開啟 Safari → Preferences → Extensions
4. 啟用「指令小幫手」

### 7. 發布到 App Store

1. 在 Xcode 選擇 Product → Archive
2. 選擇 Distribute App
3. 選擇 App Store Connect
4. 上傳到 App Store Connect
5. 在 App Store Connect 填寫資訊並提交審核

## iOS Safari Extension

iOS 版本的步驟類似，但需要：

1. 在專案中加入 iOS 目標
2. 確保 content script 支援觸控操作（已支援）
3. 測試在 iPhone/iPad 上的顯示效果

## 注意事項

- Safari Extension 需要 App 包裝，不能單獨發布
- iOS 版需要 Apple Developer Program 會員資格（$99/年）才能上架
- 本地測試可以使用免費的開發者帳號

## 共用代碼維護

建議將共用代碼放在 `shared/` 資料夾，然後用 build script 複製到各平台：

```
shared/
├── content.js
├── content.css
├── commands.js      # 預設指令資料
└── styles/

chrome-extension/    # Chrome 專用
safari-extension/    # Safari 專用
```
