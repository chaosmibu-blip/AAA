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
  { id: "git", name: "Git", icon: "git-branch", order: 2 },
  { id: "dev", name: "開發", icon: "code", order: 3 },
  { id: "debug", name: "Debug", icon: "bug", order: 4 },
  { id: "ai", name: "AI 提示詞", icon: "message-square", order: 5 },
  { id: "other", name: "其他", icon: "more-horizontal", order: 6 },
];

// 預設指令範例
export const DEFAULT_COMMANDS: Command[] = [
  {
    id: "1",
    title: "提交程式碼",
    content: 'git commit -m "完成功能"',
    categoryId: "git",
    isFavorite: true,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "2",
    title: "查看狀態",
    content: "git status",
    categoryId: "git",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "3",
    title: "推送到遠端",
    content: "git push origin main",
    categoryId: "git",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "4",
    title: "啟動開發伺服器",
    content: "npm run dev",
    categoryId: "dev",
    isFavorite: true,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "5",
    title: "檢查程式碼錯誤",
    content: "請檢查這段程式碼有沒有錯誤，並告訴我如何修正",
    categoryId: "ai",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "6",
    title: "解釋程式碼",
    content: "請用簡單的方式解釋這段程式碼在做什麼",
    categoryId: "ai",
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
