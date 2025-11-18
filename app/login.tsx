import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, User, Lock, Scan, Eye, EyeOff } from "lucide-react-native";
import { router } from "expo-router";
import { apiService } from "@/services/api";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const id = identifier.trim();
    const pass = password.trim();

    if (!id || !pass) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      // Backend expects `emailOrUsername` + `password`
      await apiService.login({
        // @ts-ignore: accept flexible shapes
        emailOrUsername: id,
        password: pass,
      });

      setIsLoading(false);
      router.replace("/(tabs)");
    } catch (error) {
      setIsLoading(false);
      const message =
        error instanceof Error ? error.message : "Please try again";
      Alert.alert("Login Failed", message);
    }
  };

  return (
    <LinearGradient colors={["#EBF8FF", "#F0FDF4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Scan size={48} color="#2563EB" strokeWidth={2} />
              </View>
              <Text style={styles.title}>Staff Scanner</Text>
              <Text style={styles.subtitle}>
                Sign in to access the staff scanner
              </Text>
            </View>

            <View style={styles.formContainer}>
              {/* Email / Username */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  {/* show a mail icon; swap to <User /> if you prefer */}
                  <Mail size={20} color="#64748B" strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email or Username"
                    placeholderTextColor="#94A3B8"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      // jump to password (RN simple form: do nothing here)
                    }}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#64748B" strokeWidth={2} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((s) => !s)}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#64748B" strokeWidth={2} />
                    ) : (
                      <Eye size={20} color="#64748B" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign in */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isLoading ? ["#94A3B8", "#64748B"] : ["#2563EB", "#1D4ED8"]}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Demo creds (match your backend example) */}
              <View style={styles.demoCredentials}>
                <Text style={styles.demoTitle}>Demo Credentials:</Text>
                <Text style={styles.demoText}>Email/Username: staff1@example.com</Text>
                <Text style={styles.demoText}>Password: Staff@123</Text>
              </View>

              <View style={styles.helpText}>
                <Text style={styles.helpTitle}>Need Help?</Text>
                <Text style={styles.helpDescription}>
                  Contact your manager for login credentials.
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: "#DBEAFE",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontSize: 32, fontWeight: "bold", color: "#1E293B", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#64748B", textAlign: "center", lineHeight: 24 },

  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  inputContainer: { marginBottom: 20 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
    paddingVertical: 16,
  },

  loginButton: {
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: { shadowOpacity: 0.1 },
  loginButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },

  demoCredentials: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  demoTitle: { fontSize: 14, fontWeight: "bold", color: "#475569", marginBottom: 8 },
  demoText: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 2,
  },

  helpText: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  helpTitle: { fontSize: 14, fontWeight: "bold", color: "#475569", marginBottom: 8 },
  helpDescription: { fontSize: 14, color: "#64748B", lineHeight: 20 },

  eyeButton: { padding: 4 },
});
