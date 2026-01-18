import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { Command } from "@/types/command";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";

interface CommandItemProps {
  command: Command;
  onCopy: (command: Command) => void;
  onEdit: (command: Command) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CommandItem({
  command,
  onCopy,
  onEdit,
  onToggleFavorite,
  onDelete,
}: CommandItemProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(command.content);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCopy(command);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(command.title, "選擇操作", [
      {
        text: "編輯",
        onPress: () => onEdit(command),
      },
      {
        text: command.isFavorite ? "取消收藏" : "加入收藏",
        onPress: () => onToggleFavorite(command.id),
      },
      {
        text: "刪除",
        style: "destructive",
        onPress: () => {
          Alert.alert("確認刪除", `確定要刪除「${command.title}」嗎？`, [
            { text: "取消", style: "cancel" },
            {
              text: "刪除",
              style: "destructive",
              onPress: () => onDelete(command.id),
            },
          ]);
        },
      },
      { text: "取消", style: "cancel" },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleCopy}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {command.title}
          </Text>
          {command.isFavorite && (
            <Feather name="star" size={14} color="#F59E0B" />
          )}
        </View>
        <Text style={styles.commandText} numberOfLines={2}>
          {command.content}
        </Text>
      </View>
      <View style={styles.copyIcon}>
        <Feather name="copy" size={18} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.light.text,
  },
  commandText: {
    ...Typography.small,
    color: "#6B7280",
    fontFamily: "monospace",
  },
  copyIcon: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
