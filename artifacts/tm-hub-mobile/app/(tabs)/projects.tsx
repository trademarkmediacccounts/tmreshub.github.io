import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useProjects, useCreateProject, useDeleteProject } from "@/lib/hooks";

const PROJECT_TYPES = ["Commercial", "Music Video", "Documentary", "Corporate", "Short Film", "Live Event", "Social Content"];

const STATUS_COLORS: Record<string, string> = {
  "Pre-Production": "#EAB308",
  Production: "#FF5E00",
  "Post-Production": "#3B82F6",
  Delivered: "#22C55E",
  Archived: "#6B7280",
};

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", type: "Commercial", client: "" });

  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createProject.mutate(
      { name: form.name, description: form.description || null, type: form.type, client: form.client || null },
      {
        onSuccess: () => {
          setModalVisible(false);
          setForm({ name: "", description: "", type: "Commercial", client: "" });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Project", `Delete "${name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteProject.mutate(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: paddingBottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: Platform.OS === "web" ? 67 : insets.top + 16, paddingHorizontal: 20, paddingBottom: 20, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              Trademark Command
            </Text>
            <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground }}>Projects</Text>
          </View>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [
              { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : projects.length === 0 ? (
            <View style={{ padding: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center" }}>
              <Feather name="folder" size={40} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>No projects yet</Text>
              <Pressable onPress={() => setModalVisible(true)} style={{ marginTop: 12 }}>
                <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium" }}>Create your first project</Text>
              </Pressable>
            </View>
          ) : (
            projects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => router.push(`/project/${project.id}` as any)}
                onLongPress={() => handleDelete(project.id, project.name)}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 16,
                    gap: 10,
                  },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center" }}>
                    <Feather name="folder" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }} numberOfLines={1}>
                      {project.name}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                      {project.type}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: `${STATUS_COLORS[project.status] ?? colors.muted}25` }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: STATUS_COLORS[project.status] ?? colors.mutedForeground }}>
                      {project.status}
                    </Text>
                  </View>
                  {project.client && (
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{project.client}</Text>
                  )}
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Project Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>New Project</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Project Name *</Text>
              <TextInput
                style={[modalStyles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Nike Summer Campaign"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View>
              <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {PROJECT_TYPES.map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => setForm((f) => ({ ...f, type }))}
                      style={[
                        modalStyles.chip,
                        {
                          backgroundColor: form.type === type ? colors.primary : colors.card,
                          borderColor: form.type === type ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[modalStyles.chipText, { color: form.type === type ? "#fff" : colors.mutedForeground }]}>
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View>
              <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Client</Text>
              <TextInput
                style={[modalStyles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={form.client}
                onChangeText={(v) => setForm((f) => ({ ...f, client: v }))}
                placeholder="Client name (optional)"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View>
              <Text style={[modalStyles.label, { color: colors.mutedForeground }]}>Description</Text>
              <TextInput
                style={[modalStyles.input, modalStyles.textarea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Brief description (optional)"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
                pressed && { opacity: 0.85 },
                (!form.name.trim() || createProject.isPending) && { opacity: 0.5 },
              ]}
              onPress={handleCreate}
              disabled={!form.name.trim() || createProject.isPending}
            >
              {createProject.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" }}>Create Project</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
