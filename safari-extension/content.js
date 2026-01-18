// Safari Extension 相容版本
// 這個檔案會自動處理 Chrome 和 Safari 的 API 差異

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// 複製 extension/content.js 的內容，但將 chrome 替換為 browserAPI
// 或直接引用共用代碼

// 載入共用的 content script
