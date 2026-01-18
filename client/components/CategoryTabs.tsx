import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Category } from "@/types/command";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

interface CategoryTabsProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  folder: "folder",
  star: "star",
  "git-branch": "git-branch",
  code: "code",
  bug: "alert-circle",
  "message-square": "message-square",
  "more-horizontal": "more-horizontal",
};

export function CategoryTabs({
  categories,
  selectedId,
  onSelect,
}: CategoryTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedId;
          const iconName = ICON_MAP[category.icon] || "folder";

          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.tab, isSelected && styles.tabSelected]}
              onPress={() => onSelect(category.id)}
              activeOpacity={0.7}
            >
              <Feather
                name={iconName}
                size={14}
                color={isSelected ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                style={[styles.tabText, isSelected && styles.tabTextSelected]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "#FFFFFF",
  },
  tabSelected: {
    backgroundColor: "#6B7280",
  },
  tabText: {
    ...Typography.small,
    color: "#6B7280",
  },
  tabTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
