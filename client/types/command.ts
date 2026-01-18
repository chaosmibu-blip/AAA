// 單一指令
export interface Command {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  isFavorite: boolean;
  usageCount: number;
  createdAt: number;
  updatedAt: number;
}

// 分類
export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

// 整體資料結構
export interface CommandStore {
  commands: Command[];
  categories: Category[];
}

// 預設分類
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "all", name: "全部", icon: "folder", order: 0 },
  { id: "favorite", name: "常用", icon: "star", order: 1 },
  { id: "prompt", name: "提問模板", icon: "message-square", order: 2 },
  { id: "git", name: "Git", icon: "git-branch", order: 3 },
  { id: "dev", name: "開發", icon: "code", order: 4 },
  { id: "debug", name: "Debug", icon: "alert-circle", order: 5 },
  { id: "other", name: "其他", icon: "more-horizontal", order: 6 },
];

// 預設指令範例
export const DEFAULT_COMMANDS: Command[] = [
  // 提問模板
  {
    id: "p1",
    title: "請求程式碼審查",
    content: `請幫我審查以下程式碼，檢查：
1. 是否有潛在的 bug 或錯誤
2. 效能是否可以優化
3. 程式碼風格是否一致
4. 有沒有安全性問題

[在這裡貼上你的程式碼]`,
    categoryId: "prompt",
    isFavorite: true,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "p2",
    title: "解釋錯誤訊息",
    content: `我遇到這個錯誤訊息：

[在這裡貼上錯誤訊息]

請用簡單易懂的方式解釋：
1. 這個錯誤是什麼意思
2. 可能的原因有哪些
3. 如何修復這個問題`,
    categoryId: "prompt",
    isFavorite: true,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "p3",
    title: "寫單元測試",
    content: `請幫以下函式寫單元測試，需要包含：
1. 正常情況的測試
2. 邊界條件測試
3. 錯誤處理測試

[在這裡貼上你的函式]`,
    categoryId: "prompt",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "p4",
    title: "重構程式碼",
    content: `請幫我重構以下程式碼，目標是：
1. 提高可讀性
2. 減少重複代碼
3. 遵循最佳實踐
4. 保持原有功能不變

請解釋你做了哪些改動和為什麼。

[在這裡貼上你的程式碼]`,
    categoryId: "prompt",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "p5",
    title: "解釋程式碼",
    content: `請用簡單的話解釋這段程式碼在做什麼，包含：
1. 整體功能說明
2. 逐行或逐區塊解釋
3. 使用了哪些技術或設計模式

[在這裡貼上程式碼]`,
    categoryId: "prompt",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "p6",
    title: "功能實作建議",
    content: `我想實作這個功能：

[描述你想做的功能]

請告訴我：
1. 推薦的技術方案
2. 需要注意的地方
3. 大概的實作步驟
4. 可能遇到的問題`,
    categoryId: "prompt",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  // Git 指令
  {
    id: "g1",
    title: "提交程式碼",
    content: 'git commit -m "完成功能"',
    categoryId: "git",
    isFavorite: true,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "g2",
    title: "查看狀態",
    content: "git status",
    categoryId: "git",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "g3",
    title: "推送到遠端",
    content: "git push origin main",
    categoryId: "git",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "g4",
    title: "拉取最新代碼",
    content: "git pull origin main",
    categoryId: "git",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "g5",
    title: "建立新分支",
    content: "git checkout -b feature/新功能名稱",
    categoryId: "git",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  // 開發指令
  {
    id: "d1",
    title: "啟動開發伺服器",
    content: "npm run dev",
    categoryId: "dev",
    isFavorite: true,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "d2",
    title: "安裝套件",
    content: "npm install 套件名稱",
    categoryId: "dev",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "d3",
    title: "執行測試",
    content: "npm test",
    categoryId: "dev",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
