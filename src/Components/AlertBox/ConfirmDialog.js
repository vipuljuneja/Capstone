import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";

const ConfirmDialog = ({
  visible, // visibility controll of modal
  title = "Are you sure?",
  message = "This action cannot be undone.",
  secondaryMessage = "All related data will be permanently removed.",
  confirmText = "DELETE",
  cancelText = "CANCEL",
  onConfirm, //func that will run
  onCancel,
  loading = false,
  blockDismiss = false,
  primaryColor = "rgba(62, 49, 83, 1)",
  backdropOpacity = 0.55, //Opacity of the background overlay
  testID = "confirm-dialog",
}) => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: backdropOpacity, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 120 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.98, duration: 140, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, backdropOpacity, fade, scale]);

  const requestClose = () => {
    if (!blockDismiss && !loading) onCancel && onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={requestClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={styles.fill} onPress={requestClose} />
      </Animated.View>

      {/* Card */}
      <View style={styles.centerWrap} pointerEvents="box-none">
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!message && <Text style={styles.message}>{message}</Text>}
          {!!secondaryMessage && (
            <Text style={[styles.message, styles.secondary]}>{secondaryMessage}</Text>
          )}

          <View style={styles.row}>
           
            <Pressable
              accessibilityRole="button"
              testID={`${testID}-confirm`}
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.buttonFilled,
                { backgroundColor: primaryColor, opacity: loading ? 0.6 : pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.buttonText, styles.buttonTextFilled]}>{confirmText}</Text>
            </Pressable>

        
            <Pressable
              accessibilityRole="button"
              testID={`${testID}-cancel`}
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.buttonOutlined,
                { borderColor: primaryColor, opacity: loading ? 0.6 : pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.buttonText, { color: primaryColor }]}>{cancelText}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  fill: { flex: 1 },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "90%",
    maxWidth: 520,
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
    textAlign: "left",
  },
  message: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    textAlign: "left",
  },
  secondary: {
    fontSize: 15,
    color: "#333",
    textAlign: "left",
    marginTop: 4,
  },
  row: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutlined: {
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  buttonFilled: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  buttonTextFilled: {
    color: "#fff",
  },
});


export default ConfirmDialog;

{/* import ConfirmDialog from "../components/ConfirmDialog";
 *
 * export default function ExampleScreen() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
 *       <Button title="Show Dialog" onPress={() => setOpen(true)} />
 *
 *       <ConfirmDialog
 *         visible={open}
 *         title="Delete Note?"
 *         message="This action cannot be undone."
 *         secondaryMessage="Your note and all data will be deleted permanently."
 *         confirmText="DELETE"
 *         cancelText="CANCEL"
 *         onConfirm={() => {
 *           // Handle delete logic here
 *           setOpen(false);
 *         }}
 *         onCancel={() => setOpen(false)}
 *       />
 *     </View>
 *   );
 */ }