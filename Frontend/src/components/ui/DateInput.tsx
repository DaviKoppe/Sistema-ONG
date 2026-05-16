import { useEffect, useState } from "react";
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

  useEffect(() => {
    setDisplay(toDisplay(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskDate(e.target.value);
    setDisplay(masked);
    onChange(toIso(masked));
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      value={display}
      onChange={handleChange}
      maxLength={10}
      className={cn(className)}
      {...props}
    />
  );
};

export default DateInput;
