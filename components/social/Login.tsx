import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const PRIMARY = "#258cf4";
const BG_DARK = "#101922";
const SURFACE = "#1b2127";
const BORDER = "#3b4754";
const MUTED = "#9cabba";

const isWide = (width: number) => width >= 1024;

type LoginProps = {
  loginUser: string;
  loginEmail: string;
  loginPass: string;
  registerMode: boolean;
  authLoading: boolean;
  authError: string;
  onUserChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPassChange: (v: string) => void;
  onToggleRegister: () => void;
  onSubmit: () => void;
  onGuest: () => void;
};

export default function LoginScreen({
  loginUser,
  loginEmail,
  loginPass,
  registerMode,
  authLoading,
  authError,
  onUserChange,
  onEmailChange,
  onPassChange,
  onToggleRegister,
  onSubmit,
  onGuest,
}: LoginProps) {
  const { width, height } = useWindowDimensions();
  const wide = isWide(width);
  const [show, setShow] = useState(false);

  const containerStyle = useMemo(() => [styles.container, { minHeight: height }], [height]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={containerStyle}>
        {wide ? (
          <View style={styles.left}>
            <View style={styles.leftInner}>
              <View style={styles.brandRow}>
                <View style={styles.brandIcon}>
                  <MaterialIcons name="hub" size={26} color="#fff" />
                </View>
                <Text style={styles.brandName}>FNAP</Text>
              </View>

              <Text style={styles.heroTitle}>FNAP</Text>
              <Text style={styles.heroSub}>
                5 Nights at Parlamentul Romaniei. Supravietuieste, gestioneaza power-ul si tine animatronicii la distanta.
              </Text>

              <Pressable style={styles.guestBtn} onPress={onGuest}>
                <MaterialIcons name="person" size={18} color="#fff" />
                <Text style={styles.guestText}>Continue as Guest</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={[styles.right, wide ? styles.rightWide : null]}>
          <View style={styles.formWrap}>
            <View style={styles.heading}>
              <Text style={styles.welcome}>Welcome Back</Text>
              <Text style={styles.subtitle}>Please enter your details to sign in.</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                value={loginUser}
                onChangeText={onUserChange}
                placeholder="Nume / Call-sign"
                placeholderTextColor="rgba(156,171,186,0.5)"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {registerMode ? (
              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  value={loginEmail}
                  onChangeText={onEmailChange}
                  placeholder="example@domain.com"
                  placeholderTextColor="rgba(156,171,186,0.5)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={loginPass}
                  onChangeText={onPassChange}
                  placeholder="********"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  secureTextEntry={!show}
                  autoCapitalize="none"
                  style={[styles.input, { paddingRight: 52 }]}
                />
                <Pressable onPress={() => setShow((s) => !s)} style={styles.eyeBtn} hitSlop={8}>
                  <MaterialIcons name={show ? "visibility-off" : "visibility"} size={22} color={MUTED} />
                </Pressable>
              </View>
            </View>

            {!!authError && <Text style={styles.error}>{authError}</Text>}

            <Pressable style={styles.signInBtn} onPress={onSubmit} disabled={authLoading}>
              <Text style={styles.signInText}>
                {registerMode ? (authLoading ? "REGISTER..." : "REGISTER") : authLoading ? "LOGIN..." : "LOGIN"}
              </Text>
            </Pressable>

            {!wide ? (
              <Pressable style={styles.guestBtnInline} onPress={onGuest}>
                <MaterialIcons name="person" size={18} color="#fff" />
                <Text style={styles.guestText}>Continue as Guest</Text>
              </Pressable>
            ) : null}

            <Pressable onPress={onToggleRegister} style={styles.toggleBtn}>
              <Text style={styles.toggleText}>{registerMode ? "Have account? Login" : "Create account"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DARK },
  container: { flex: 1, flexDirection: "row", backgroundColor: BG_DARK },

  left: {
    flex: 3,
    padding: 48,
    justifyContent: "center",
    backgroundColor: "rgba(37,140,244,0.10)",
  },
  leftInner: { maxWidth: 720 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 26 },
  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { color: "#fff", fontSize: 28, fontWeight: "900" },
  heroTitle: { color: "#fff", fontSize: 52, fontWeight: "900", lineHeight: 56 },
  heroSub: { color: MUTED, fontSize: 18, lineHeight: 26, marginTop: 14, marginBottom: 22, maxWidth: 680 },
  guestBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  guestBtnInline: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    justifyContent: "center",
  },
  guestText: { color: "#fff", fontSize: 14, fontWeight: "900" },

  right: { flex: 1, paddingHorizontal: 24, paddingVertical: 32, justifyContent: "center", alignItems: "center" },
  rightWide: { flex: 2, paddingHorizontal: 64 },
  formWrap: { width: "100%", maxWidth: 440, gap: 16 },
  heading: { marginBottom: 10 },
  welcome: { color: "#fff", fontSize: 36, fontWeight: "900", lineHeight: 40 },
  subtitle: { color: MUTED, fontSize: 16, marginTop: 6 },
  field: { gap: 8 },
  label: { color: "#fff", fontSize: 13, fontWeight: "700", marginLeft: 6 },
  input: {
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    paddingHorizontal: 20,
    color: "#fff",
    fontSize: 16,
  },
  passwordWrap: { position: "relative", justifyContent: "center" },
  eyeBtn: { position: "absolute", right: 18, height: 56, justifyContent: "center" },
  signInBtn: {
    marginTop: 8,
    height: 56,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  toggleBtn: { marginTop: 8, alignItems: "center" },
  toggleText: { color: MUTED, fontWeight: "800" },
  error: { color: "#ff8a8a", fontWeight: "800" },
});

