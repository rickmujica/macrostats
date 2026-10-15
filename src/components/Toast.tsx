import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastOptions = {
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

type ToastState = ToastOptions & { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Sits above the tab bar so the toast never covers navigation.
const TAB_BAR_CLEARANCE = 70;

const TOAST_COLORS = {
  background: '#111827',
  border: 'rgba(255,255,255,0.15)',
  text: '#ffffff',
  action: '#7dd3fc',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() =>
      setToast(null),
    );
  }, [opacity]);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    setToast({ id: Date.now(), message, ...options });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(hide, toast.durationMs ?? (toast.onAction ? 6000 : 2500));

    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [toast, opacity, hide]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom + TAB_BAR_CLEARANCE,
          // A fixed dark surface reads well on both the light and dark themes.
          backgroundColor: TOAST_COLORS.background,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: TOAST_COLORS.border,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        },
        message: {
          flex: 1,
          color: TOAST_COLORS.text,
          fontSize: 15,
        },
        action: {
          color: TOAST_COLORS.action,
          fontSize: 15,
          fontWeight: '700',
          marginLeft: 16,
        },
      }),
    [insets.bottom],
  );

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      <View style={{ flex: 1 }}>
        {children}
        {toast && (
          <Animated.View
            key={toast.id}
            style={[styles.container, { opacity }]}
            accessibilityLiveRegion='polite'
          >
            <Text style={styles.message}>{toast.message}</Text>
            {toast.actionLabel && toast.onAction ? (
              <TouchableOpacity
                onPress={() => {
                  toast.onAction?.();
                  hide();
                }}
                hitSlop={8}
              >
                <Text style={styles.action}>{toast.actionLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
