// app/ScannerScreen.tsx
import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Scan, X } from "lucide-react-native";
import { apiService } from "@/services/api";

type MemberLite = {
  memberId: string;
  programId: string;
  points: number; // stamps
};

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<MemberLite | null>(null);
  const scanLockedRef = useRef(false);

  const startScan = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert("Camera permission needed", "Please allow camera to scan QR codes.");
        return;
      }
    }
    scanLockedRef.current = false;
    setIsScanning(true);
    setMember(null);
  };

  const stopScan = () => setIsScanning(false);

  const handleBarcodeScanned = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      if (scanLockedRef.current) return;
      scanLockedRef.current = true;
      setIsScanning(false);
      setLoading(true);
      try {
        // POST /api/passkit/get-member-by-barcode
        const res = await apiService.getMemberByBarcode(data);
        if (!res?.success) throw new Error("Member not found");

        // response shape from your example
        const info = res.data;
        setMember({
          memberId: info.memberId,
          programId: info.programId,
          points: info.memberData.points,
        });
      } catch (e: any) {
        Alert.alert("Scan failed", e?.message || "Unable to fetch member");
        setMember(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateBy = async (delta: 1 | -1) => {
    if (!member) return;
    setLoading(true);
    try {
      const res =
        delta === 1
          ? await apiService.addPoints(member.programId, member.memberId, 1) // +1 stamp
          : await apiService.burnPoints(member.programId, member.memberId, 1); // -1 stamp

      if (!res?.success) throw new Error("Update failed");
      setMember({ ...member, points: res.result.points });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not update stamps");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Loyalty Scanner (Stamps)</Text>
        {isScanning && (
          <TouchableOpacity style={styles.iconBtn} onPress={stopScan}>
            <X size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Camera */}
      {isScanning ? (
        <View style={{ flex: 1 }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          >
            <View style={styles.overlay}>
              <View style={styles.frame} />
              <Text style={styles.tip}>Align the QR within the box</Text>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.body}>
          {/* Scan button */}
          {!member && !loading && (
            <TouchableOpacity activeOpacity={0.9} onPress={startScan} style={styles.cta}>
              <LinearGradient colors={["#2563EB", "#1D4ED8"]} style={styles.ctaGrad}>
                <Scan size={22} color="#fff" />
                <Text style={styles.ctaText}>Scan Member</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Loader */}
          {loading && (
            <View style={styles.card}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, fontWeight: "600" }}>Processing…</Text>
            </View>
          )}

          {/* Member info + actions */}
          {member && !loading && (
            <View style={styles.card}>
              <Text style={styles.label}>Member ID</Text>
              <Text style={styles.value}>{member.memberId}</Text>

              <Text style={[styles.label, { marginTop: 12 }]}>Program ID</Text>
              <Text style={styles.value}>{member.programId}</Text>

              <Text style={[styles.label, { marginTop: 12 }]}>Stamps</Text>
              <Text style={[styles.value, { fontSize: 28 }]}>{member.points}</Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: "#059669" }]}
                  onPress={() => updateBy(1)}
                  disabled={loading}
                >
                  <Text style={styles.smallBtnText}>+ Add Stamp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: "#DC2626" }]}
                  onPress={() => updateBy(-1)}
                  disabled={loading}
                >
                  <Text style={styles.smallBtnText}>− Remove Stamp</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.linkBtn, { marginTop: 12 }]}
                onPress={startScan}
                disabled={loading}
              >
                <Text style={styles.linkBtnText}>Scan Another</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "800" },
  iconBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
  },

  body: { flex: 1, padding: 16, gap: 16, backgroundColor: "#F1F5F9" },

  cta: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  label: { fontSize: 12, color: "#64748B", fontWeight: "700" },
  value: { fontSize: 16, color: "#0F172A", fontWeight: "800", marginTop: 2 },

  row: { flexDirection: "row", gap: 10, marginTop: 16 },
  smallBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  smallBtnText: { color: "#fff", fontWeight: "900" },

  linkBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  linkBtnText: { color: "#2563EB", fontWeight: "800" },

  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 4,
    borderColor: "#fff",
    borderRadius: 12,
  },
  tip: { color: "#fff", marginTop: 16, fontWeight: "700" },
});
