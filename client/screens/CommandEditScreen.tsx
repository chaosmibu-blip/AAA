import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useCommands } from "@/hooks/useCommands";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, Typography, Colors } from "@/constants/theme";

type Props = NativeStackScreenProps<RootStackParamList, "CommandEdit">;

export default function CommandEditScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { commandId } = route.params || {};
  const isEditing = !!commandId;

  const { getCommand, getSelectableCategories, addCommand, updateCommand } =
    useCommands();

  const categories = getSelectableCategories();
  const existingCommand = commandId ? getCommand(commandId) : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("other");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (existingCommand) {
      setTitle(existingCommand.title);
      setContent(existingCommand.content);
      setCategoryId(existingCommand.categoryId);
      setIsFavorite(existingCommand.isFavorite);
    }
  }, [existingCommand]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("請輸入指令名稱");
      return;
    }
    if (!content.trim()) {
      Alert.alert("請輸入指令內容");
      return;
    }

    if (isEditing && commandId) {
      await updateCommand(commandId, {
        title: title.trim(),
        content: content.trim(),
        categoryId,
        isFavorite,
      });
    } else {
      await addCommand({
        title: title.trim(),
        content: content.trim(),
        categoryId,
        isFavorite,
      });
    }

    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Feather name="x" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? "編輯指令" : "新增指令"}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Feather name="check" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>指令名稱</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="例如：提交程式碼"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Content Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>指令內容</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder='例如：git commit -m "完成功能"'
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>分類</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    categoryId === cat.id && styles.categoryItemSelected,
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      categoryId === cat.id && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Favorite Toggle */}
          <TouchableOpacity
            style={styles.favoriteToggle}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Feather
              name={isFavorite ? "star" : "star"}
              size={20}
              color={isFavorite ? "#F59E0B" : "#9CA3AF"}
            />
            <Text style={styles.favoriteText}>
              {isFavorite ? "已加入常用" : "加入常用"}
            </Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>儲存</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  headerButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryItemSelected: {
    backgroundColor: "#6B7280",
    borderColor: "#6B7280",
  },
  categoryText: {
    ...Typography.small,
    color: "#6B7280",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  favoriteToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: Spacing.xl,
  },
  favoriteText: {
    ...Typography.body,
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: "#6B7280",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: "center",
  },
  saveButtonText: {
    ...Typography.body,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
