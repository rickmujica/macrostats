import type { AlertButton } from 'react-native';

/**
 * react-native-web's Alert does nothing, so on the web messages and confirmations
 * use the browser's own dialogs: OK runs the last action and Cancel the cancel button
 * (or the first action when the alert has two actions and no cancel).
 */
export function alert(title: string, message?: string, buttons?: AlertButton[]) {
  const text = message ? `${title}\n\n${message}` : title;
  const actions = buttons?.filter((b) => b.style !== 'cancel') ?? [];
  const action = actions.at(-1);
  if (!action) {
    window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }
  const cancel = buttons?.find((b) => b.style === 'cancel') ?? (actions.length > 1 ? actions[0] : undefined);
  if (window.confirm(text)) action.onPress?.();
  else cancel?.onPress?.();
}
