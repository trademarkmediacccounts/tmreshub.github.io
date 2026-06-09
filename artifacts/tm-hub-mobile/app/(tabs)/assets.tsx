import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
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
import { useAssets, useCreateAsset, useDeleteAsset, useUpdateAsset } from "@/lib/hooks";
import type { Asset } from "@/lib/hooks";

const ASSET_TYPES = ["Video", "Audio", "Image", "Document", "Raw Footage", "Graphic", "Other"];
const ASSET_STATUSES = ["Draft", "Review", "Approved"];

const STATUS_COLORS: Record<string, string> = {
  Approved: "#22C55E",
  Review: "#FF5E00",
  Draft: "#6B7280",
};

const TYPE_ICONS: Record<string, string> = {
  Video: "film",
  Audio: "music",
  Image: "image",
  Document: "file-text",
  "Raw Footage": "video",
  Graphic: "layers",
  Other: "package",
};

export default function AssetsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: assets = [], isLoading } = useAssets();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const [modalVisible, setModalVisible] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", type: "Video", client: "", status: "Draft", notes: "" });

  const filtered = assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const openCreate = () => {
    setEditAsset(null);
    setForm({ name: "", type: "Video", client: "", status: "Draft", notes: "" });
    setModalVisible(true);
  };

  const openEdit = (asset: Asset) => {
    setEditAsset(asset);
    setForm({ name: asset.name, type: asset.type, client: asset.client ?? "", status: asset.status, notes: asset.notes ?? "" });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editAsset) {
      updateAsset.mutate(
        { id: editAsset.id, name: form.name, type: form.type, client: form.client || null, status: form.status, notes: form.notes || null },
        {
          onSuccess: () => {
            setModalVisible(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        }
      );
    } else {
      createAsset.mutate(
        { name: form.name, type: form.type, client: form.client || null, status: form.status, notes: form.notes || null },
        {
          onSuccess: () => {
            setModalVisible(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        }
      );
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Asset", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAsset.mutate(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: paddingBottom + 80 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {/* Header */}
            <View style={{ paddingTop: Platform.OS === "web" ? 67 : insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Trademark Command
                </Text>
                <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground }}>Assets</Text>
              </View>
              <Pressable
                onPress={openCreate}
                style={({ pressed }) => [
                  { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Feather name="plus" size={20} color="#fff" />
              </Pressable>
            </View>

            {/* Search */}
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.input, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
                <Feather name="search" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={{ flex: 1, fontSize: 15, color: colors.foreground, fontFamily: "Inter_400Regular" }}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search assets..."
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() =>
          isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={{ paddingHorizontal: 20 }}>
              <View style={{ padding: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center" }}>
                <Feather name="image" size={40} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>
                  {search ? "No assets found" : "No assets yet"}
                </Text>
                {!search && (
                  <Pressable onPress={openCreate} style={{ marginTop: 12 }}>
                    <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium" }}>Upload first asset</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            <Pressable
              onPress={() => openEdit(item)}
              onLongPress={() => handleDelete(item.id, item.name)}
              style={({ pressed }) => [
                { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
                pressed && { opacity: 0.75 },
              ]}
            >
              <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center" }}>
                <Feather name={(TYPE_ICONS[item.type] ?? "package") as any} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                  {item.type}{item.client ? ` · ${item.client}` : ""}
                </Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: `${STATUS_COLORS[item.status] ?? colors.muted}20` }}>
                <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: STATUS_COLORS[item.status] ?? colors.mutedForeground }}>
                  {item.status}
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>
              {editAsset ? "Edit Asset" : "Upload Asset"}
            </Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Asset Name *</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Hero_Shot_v3.mp4"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Type</Text>
              <ScrollChips
                options={ASSET_TYPES}
                selected={form.type}
                onSelect={(v) => setForm((f) => ({ ...f, type: v }))}
                colors={colors}
              />
            </View>

            <View>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Status</Text>
              <ScrollChips
                options={ASSET_STATUSES}
                selected={form.status}
                onSelect={(v) => setForm((f) => ({ ...f, status: v }))}
                colors={colors}
              />
            </View>

            <View>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Client</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={form.client}
                onChangeText={(v) => setForm((f) => ({ ...f, client: v }))}
                placeholder="Client name (optional)"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
                pressed && { opacity: 0.85 },
                (!form.name.trim() || createAsset.isPending || updateAsset.isPending) && { opacity: 0.5 },
              ]}
              onPress={handleSave}
              disabled={!form.name.trim() || createAsset.isPending || updateAsset.isPending}
            >
              {(createAsset.isPending || updateAsset.isPending) ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" }}>
                  {editAsset ? "Save Changes" : "Upload Asset"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ScrollChips({ options, selected, onSelect, colors }: { options: string[]; selected: string; onSelect: (v: string) => void; colors: any }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onSelect(opt)}
          style={[
            s.chip,
            {
              backgroundColor: selected === opt ? colors.primary : colors.card,
              borderColor: selected === opt ? colors.primary : colors.border,
            },
          ]}
        >
          <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: selected === opt ? "#fff" : colors.mutedForeground }}>
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
});
