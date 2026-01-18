import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Command,
  Category,
  CommandStore,
  DEFAULT_CATEGORIES,
  DEFAULT_COMMANDS,
} from "@/types/command";

const STORAGE_KEY = "command_store";

// 生成唯一 ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export function useCommands() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: CommandStore = JSON.parse(stored);
        setCommands(data.commands);
        setCategories(data.categories);
      } else {
        // 首次使用，載入預設資料
        setCommands(DEFAULT_COMMANDS);
        setCategories(DEFAULT_CATEGORIES);
        await saveData(DEFAULT_COMMANDS, DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error("Failed to load commands:", error);
      setCommands(DEFAULT_COMMANDS);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 載入資料
  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = async (cmds: Command[], cats: Category[]) => {
    try {
      const data: CommandStore = { commands: cmds, categories: cats };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save commands:", error);
    }
  };

  // 新增指令
  const addCommand = useCallback(
    async (
      command: Omit<Command, "id" | "usageCount" | "createdAt" | "updatedAt">,
    ) => {
      const newCommand: Command = {
        ...command,
        id: generateId(),
        usageCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const newCommands = [...commands, newCommand];
      setCommands(newCommands);
      await saveData(newCommands, categories);
      return newCommand;
    },
    [commands, categories],
  );

  // 更新指令
  const updateCommand = useCallback(
    async (id: string, updates: Partial<Omit<Command, "id" | "createdAt">>) => {
      const newCommands = commands.map((cmd) =>
        cmd.id === id ? { ...cmd, ...updates, updatedAt: Date.now() } : cmd,
      );
      setCommands(newCommands);
      await saveData(newCommands, categories);
    },
    [commands, categories],
  );

  // 刪除指令
  const deleteCommand = useCallback(
    async (id: string) => {
      const newCommands = commands.filter((cmd) => cmd.id !== id);
      setCommands(newCommands);
      await saveData(newCommands, categories);
    },
    [commands, categories],
  );

  // 記錄使用次數
  const incrementUsage = useCallback(
    async (id: string) => {
      const newCommands = commands.map((cmd) =>
        cmd.id === id ? { ...cmd, usageCount: cmd.usageCount + 1 } : cmd,
      );
      setCommands(newCommands);
      await saveData(newCommands, categories);
    },
    [commands, categories],
  );

  // 切換收藏狀態
  const toggleFavorite = useCallback(
    async (id: string) => {
      const newCommands = commands.map((cmd) =>
        cmd.id === id
          ? { ...cmd, isFavorite: !cmd.isFavorite, updatedAt: Date.now() }
          : cmd,
      );
      setCommands(newCommands);
      await saveData(newCommands, categories);
    },
    [commands, categories],
  );

  // 根據分類篩選指令
  const getFilteredCommands = useCallback(() => {
    let filtered = commands;

    if (selectedCategoryId === "favorite") {
      filtered = commands.filter((cmd) => cmd.isFavorite);
    } else if (selectedCategoryId !== "all") {
      filtered = commands.filter(
        (cmd) => cmd.categoryId === selectedCategoryId,
      );
    }

    // 依使用次數排序（常用優先）
    return filtered.sort((a, b) => {
      // 收藏的優先
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      // 使用次數多的優先
      return b.usageCount - a.usageCount;
    });
  }, [commands, selectedCategoryId]);

  // 取得單一指令
  const getCommand = useCallback(
    (id: string) => {
      return commands.find((cmd) => cmd.id === id);
    },
    [commands],
  );

  // 取得可選擇的分類（排除 all 和 favorite）
  const getSelectableCategories = useCallback(() => {
    return categories.filter(
      (cat) => cat.id !== "all" && cat.id !== "favorite",
    );
  }, [categories]);

  return {
    commands,
    categories,
    isLoading,
    selectedCategoryId,
    setSelectedCategoryId,
    addCommand,
    updateCommand,
    deleteCommand,
    incrementUsage,
    toggleFavorite,
    getFilteredCommands,
    getCommand,
    getSelectableCategories,
  };
}
