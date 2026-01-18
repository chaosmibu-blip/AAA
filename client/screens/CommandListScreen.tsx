import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useCommands } from "@/hooks/useCommands";
import { CommandItem } from "@/components/CommandItem";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Command } from "@/types/command";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, Typography, Colors } from "@/constants/theme";

type Props = NativeStackScreenProps<RootStackParamList, "CommandList">;

export default function CommandListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    categories,
    isLoading,
    selectedCategoryId,
    setSelectedCategoryId,
    incrementUsage,
    toggleFavorite,
    deleteCommand,
    getFilteredCommands,
  } = useCommands();

  const filteredCommands = getFilteredCommands();

  const handleCopy = (command: Command) => {
    incrementUsage(command.id);
    setCopiedId(command.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleEdit = (command: Command) => {
    navigation.navigate("CommandEdit", { commandId: command.id });
  };

  const handleAdd = () => {
    navigation.navigate("CommandEdit", {});
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Feather name="x" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的指令</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Feather name="plus" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      {/* Command List */}
      <FlatList
        data={filteredCommands}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
        renderItem={({ item }) => (
          <View>
            <CommandItem
              command={item}
              onCopy={handleCopy}
              onEdit={handleEdit}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteCommand}
            />
            {copiedId === item.id && (
              <View style={styles.copiedToast}>
                <Feather name="check" size={12} color="#FFFFFF" />
                <Text style={styles.copiedText}>已複製</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>還沒有指令</Text>
            <Text style={styles.emptySubtext}>點擊右上角 + 新增指令</Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + Spacing.lg }]}
        onPress={handleAdd}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.light.text,
  },
  addButton: {
    padding: Spacing.xs,
  },
  listContent: {
    paddingTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    ...Typography.body,
    color: "#9CA3AF",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    ...Typography.small,
    color: "#D1D5DB",
    marginTop: Spacing.xs,
  },
  copiedToast: {
    position: "absolute",
    right: Spacing.lg + Spacing.md,
    top: "50%",
    transform: [{ translateY: -12 }],
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#10B981",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  copiedText: {
    ...Typography.small,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6B7280",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
