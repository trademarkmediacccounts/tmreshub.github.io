import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import {
  useProject,
  useShots,
  useCallSheets,
  useProjectAssets,
  useCreateShot,
  useUpdateShot,
  type Shot,
} from "@/lib/hooks";

const SHOT_STATUSES = ["Todo", "In Progress", "Done"];
const STATUS_COLORS: Record<string, string> = {
  "Pre-Production": "#EAB308",
  Production: "#FF5E00",
  "Post-Production": "#3B82F6",
  Delivered: "#22C55E",
  Archived: "#6B7280",
  Todo: "#6B7280",
  "In Progress": "#EAB308",
  Done: "#22C55E",
};

type Tab = "overview" | "shots" | "schedule" | "files";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [shotModalVisible, setShotModalVisible] = useState(false);
  const [editShot, setEditShot] = useState<Shot | null>(null);
  const [shotForm, setShotForm] = useState({ shotNumber: "", description: "", shotType: "Wide", status: "Todo" });

  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: shots = [], isLoading: shotsLoading } = useShots(id);
  const { data: callSheets = [], isLoading: sheetsLoading } = useCallSheets(id);
  const { data: projectAssets = [], isLoading: filesLoading } = useProjectAssets(id);
  const createShot = useCreateShot();
  const updateShot = useUpdateShot();

  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const openCreateShot = () => {
    setEditShot(null);
    setShotForm({ shotNumber: `${shots.length + 1}`, description: "", shotType: "Wide", status: "Todo" });
    setShotModalVisible(true);
  };

  const openEditShot = (shot: Shot) => {
    setEditShot(shot);
    setShotForm({ shotNumber: shot.shotNumber, description: shot.description ?? "", shotType: shot.shotType, status: shot.status });
    setShotModalVisible(true);
  };

  const handleSaveShot = () => {
    if (!shotForm.shotNumber.trim() || !id) return;
    if (editShot) {
      updateShot.mutate(
        { id: editShot.id, projectId: id, ...shotForm },
        { onSuccess: () => { setShotModalVisible(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }
      );
    } else {
      createShot.mutate(
        { projectId: id, ...shotForm, sortOrder: shots.length },
        { onSuccess: () => { setShotModalVisible(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }
      );
    }
  };

  if (projectLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Project not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const TABS: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: "overview", label: "Overview", icon: "grid", count: 0 },
    { key: "shots", label: "Shots", icon: "camera", count: shots.length },
    { key: "schedule", label: "Schedule", icon: "calendar", count: callSheets.length },
    { key: "files", label: "Files", icon: "folder", count: projectAssets.length },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: Platform.OS === "web" ? 67 : insets.top + 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: colors.background }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ padding: 6 }, pressed && { opacity: 0.7 }]}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }} numberOfLines={1}>
              {project.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{project.type}</Text>
              {project.client && (
                <>
                  <Text style={{ fontSize: 12, color: colors.border }}>·</Text>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{project.client}</Text>
                </>
              )}
            </View>
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: `${STATUS_COLORS[project.status] ?? colors.muted}20` }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: STATUS_COLORS[project.status] ?? colors.mutedForeground }}>
              {project.status}
            </Text>
          </View>
        </View>

        {/* Tab bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {TABS.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                  },
                  activeTab === tab.key
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Feather name={tab.icon as any} size={14} color={activeTab === tab.key ? "#fff" : colors.mutedForeground} />
                <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: activeTab === tab.key ? "#fff" : colors.mutedForeground }}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View style={{ backgroundColor: activeTab === tab.key ? "rgba(255,255,255,0.3)" : colors.muted, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 }}>
                    <Text style={{ fontSize: 11, color: activeTab === tab.key ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: paddingBottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && (
          <View style={{ gap: 16 }}>
            {project.description && (
              <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  Description
                </Text>
                <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 20 }}>
                  {project.description}
                </Text>
              </View>
            )}

            {/* Stats */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { label: "Shots", value: shots.length, icon: "camera" },
                { label: "Schedules", value: callSheets.length, icon: "calendar" },
                { label: "Files", value: projectAssets.length, icon: "folder" },
              ].map((stat) => (
                <View key={stat.label} style={{ flex: 1, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: "center" }}>
                  <Feather name={stat.icon as any} size={18} color={colors.primary} />
                  <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 6 }}>{stat.value}</Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Details */}
            {(project.startDate || project.endDate) && (
              <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 12 }}>
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1 }}>
                  Dates
                </Text>
                {project.startDate && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Start</Text>
                    <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: "Inter_500Medium" }}>{project.startDate}</Text>
                  </View>
                )}
                {project.endDate && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>End</Text>
                    <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: "Inter_500Medium" }}>{project.endDate}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === "shots" && (
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={openCreateShot}
              style={({ pressed }) => [
                { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: `${colors.primary}20`, borderRadius: 10, borderWidth: 1, borderColor: `${colors.primary}40`, paddingVertical: 12 },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="plus" size={16} color={colors.primary} />
              <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: colors.primary }}>Add Shot</Text>
            </Pressable>

            {shotsLoading ? (
              <ActivityIndicator color={colors.primary} style={{ paddingVertical: 20 }} />
            ) : shots.length === 0 ? (
              <View style={{ padding: 32, alignItems: "center" }}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>No shots yet</Text>
              </View>
            ) : (
              shots.map((shot) => (
                <Pressable
                  key={shot.id}
                  onPress={() => openEditShot(shot)}
                  style={({ pressed }) => [
                    { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary }}>
                      {shot.shotNumber}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                      {shot.shotType} Shot
                    </Text>
                    {shot.description && (
                      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }} numberOfLines={1}>
                        {shot.description}
                      </Text>
                    )}
                  </View>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: `${STATUS_COLORS[shot.status] ?? colors.muted}20` }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: STATUS_COLORS[shot.status] ?? colors.mutedForeground }}>
                      {shot.status}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {activeTab === "schedule" && (
          <View style={{ gap: 10 }}>
            {sheetsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : callSheets.length === 0 ? (
              <View style={{ padding: 32, alignItems: "center", backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                <Feather name="calendar" size={32} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular" }}>No call sheets yet</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" }}>
                  Create call sheets from the web app to schedule your crew
                </Text>
              </View>
            ) : (
              callSheets.map((sheet) => (
                <View
                  key={sheet.id}
                  style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16 }}
                >
                  <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{sheet.title}</Text>
                  {sheet.shootDate && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <Feather name="calendar" size={13} color={colors.mutedForeground} />
                      <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{sheet.shootDate}</Text>
                      {sheet.callTime && <Text style={{ fontSize: 13, color: colors.mutedForeground }}>· {sheet.callTime}</Text>}
                    </View>
                  )}
                  {sheet.location && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <Feather name="map-pin" size={13} color={colors.mutedForeground} />
                      <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{sheet.location}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "files" && (
          <View style={{ gap: 10 }}>
            {filesLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : projectAssets.length === 0 ? (
              <View style={{ padding: 32, alignItems: "center", backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                <Feather name="folder" size={32} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular" }}>No files yet</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" }}>
                  Upload project files from the web app
                </Text>
              </View>
            ) : (
              projectAssets.map((file) => (
                <View
                  key={file.id}
                  style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center" }}>
                    <Feather name="file" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{file.type}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: `${STATUS_COLORS[file.status] ?? colors.muted}20` }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: STATUS_COLORS[file.status] ?? colors.mutedForeground }}>
                      {file.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Shot Modal */}
      <Modal visible={shotModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShotModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>
              {editShot ? "Edit Shot" : "Add Shot"}
            </Text>
            <Pressable onPress={() => setShotModalVisible(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={[ms.label, { color: colors.mutedForeground }]}>Shot Number *</Text>
              <TextInput
                style={[ms.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={shotForm.shotNumber}
                onChangeText={(v) => setShotForm((f) => ({ ...f, shotNumber: v }))}
                placeholder="e.g. 1A"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View>
              <Text style={[ms.label, { color: colors.mutedForeground }]}>Type</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                {["Wide", "Medium", "Close-up", "POV", "Aerial", "Tracking"].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setShotForm((f) => ({ ...f, shotType: t }))}
                    style={[
                      ms.chip,
                      {
                        backgroundColor: shotForm.shotType === t ? colors.primary : colors.card,
                        borderColor: shotForm.shotType === t ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: shotForm.shotType === t ? "#fff" : colors.mutedForeground }}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text style={[ms.label, { color: colors.mutedForeground }]}>Status</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                {SHOT_STATUSES.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => setShotForm((f) => ({ ...f, status }))}
                    style={[
                      ms.chip,
                      {
                        backgroundColor: shotForm.status === status ? colors.primary : colors.card,
                        borderColor: shotForm.status === status ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: shotForm.status === status ? "#fff" : colors.mutedForeground }}>{status}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text style={[ms.label, { color: colors.mutedForeground }]}>Description</Text>
              <TextInput
                style={[ms.input, ms.textarea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={shotForm.description}
                onChangeText={(v) => setShotForm((f) => ({ ...f, description: v }))}
                placeholder="Shot description..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
                pressed && { opacity: 0.85 },
                (!shotForm.shotNumber.trim() || createShot.isPending || updateShot.isPending) && { opacity: 0.5 },
              ]}
              onPress={handleSaveShot}
              disabled={!shotForm.shotNumber.trim() || createShot.isPending || updateShot.isPending}
            >
              {(createShot.isPending || updateShot.isPending) ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" }}>
                  {editShot ? "Save Changes" : "Add Shot"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const ms = StyleSheet.create({
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
});
