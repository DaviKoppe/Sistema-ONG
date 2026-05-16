import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateInputProps extends Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange" | "maxLength"> {
  value: string;
  onChange: (iso: string) => void;
}

const toDisplay = (iso: string): string => {
  if (!iso || iso.length !== 10) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
};

const maskDate = (raw: string): string => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};

const toIso = (display: string): string => {
  const d = display.replace(/\D/g, "");
  if (d.length !== 8) return "";
  return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`;
};

const DateInput = ({ value, onChange, className, ...props }: DateInputProps) => {
  const [display, setDisplay] = useState(() => toDisplay(value));
  const [isFocused, setIsFocused] = useState(false);
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplay(toDisplay(value));
  }, [value]);

  const handleVisibleClick = () => {
    datePickerRef.current?.focus();
    datePickerRef.current?.showPicker?.();
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        readOnly
        placeholder="dd/mm/aaaa"
        value={display}
        onClick={handleVisibleClick}
        className={cn(className, "pr-10", isFocused && "ring-2 ring-ring")}
        {...props}
      />
      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={datePickerRef}
        type="date"
        value={value}
        onChange={handleDatePickerChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default DateInput;
