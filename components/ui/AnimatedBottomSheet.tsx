import { useTheme } from "@hooks/useThemeColor";
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import Modal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: (handleClose: () => void) => React.ReactNode;
  snapPoint?: number; // Kept for backward compatibility — ignored
  withoutPadding?: boolean;
  renderOverlays?: () => React.ReactNode;
}

export function AnimatedBottomSheet({
  visible,
  onClose,
  children,
  withoutPadding = false,
  renderOverlays,
}: AnimatedBottomSheetProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <>
      <Modal
        isVisible={visible}
        onBackdropPress={handleClose}
        onBackButtonPress={handleClose}
        onSwipeComplete={handleClose}
        swipeDirection="down"
        swipeThreshold={60}
        propagateSwipe
        avoidKeyboard
        useNativeDriverForBackdrop
        backdropOpacity={0.3}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={350}
        animationOutTiming={400}
        style={styles.modal}
        statusBarTranslucent
        hideModalContentWhileAnimating
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              paddingBottom: insets.bottom || 16,
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View
              style={[styles.handle, { backgroundColor: colors.border }]}
            />
          </View>

          {/* Content */}
          <View style={withoutPadding ? {} : styles.content}>
            {children(handleClose)}
          </View>
        </View>

        {/* Portals / Overlays */}
        {renderOverlays?.()}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
  },
});
