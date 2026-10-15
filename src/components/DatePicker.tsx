import { DateTimePicker } from '@expo/ui/community/datetime-picker';

type DatePickerProps = {
  date: Date;
  setDate: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
  possitiveBtnLabel?: { label: string };
  negativeBtnLabel?: { label: string };
};

export default function DatePicker({
  date,
  setDate,
  visible,
  onClose,
  possitiveBtnLabel,
  negativeBtnLabel,
}: DatePickerProps) {
  if (!visible) return null;

  return (
    <DateTimePicker
      value={date}
      onValueChange={(event, selectedDate) => {
        if (selectedDate) setDate(selectedDate);
        onClose(); // desmonta el picker tras confirmar/cancelar
      }}
      onDismiss={onClose} // por si toca fuera / back button
      mode="date"
      positiveButton={possitiveBtnLabel}
      negativeButton={negativeBtnLabel}
    />
  );
}