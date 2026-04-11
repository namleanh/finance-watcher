import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string | number;
  onChange: (e: { target: { value: string } }) => void;
  currency?: string;
  rate?: number;
}

export default function CurrencyInput({ value, onChange, className, currency, rate, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const isVND = currency === 'VND';

  const format = (val: string | number) => {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return '';

    if (isVND) {
      // VND: No decimals, round to nearest integer
      return Math.round(Number(val)).toLocaleString('en-US');
    } else {
      // Non-VND: Standard 2 decimal places for auto-mask
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  useEffect(() => {
    // Skip updating if the value is currently being edited with a trailing dot/comma in VND mode
    if (isVND && String(value).endsWith('.')) return;
    
    setDisplayValue(format(value));
  }, [value, currency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    if (isVND) {
      // VND: Ignore all non-digits, no decimals allowed
      const rawStr = val.replace(/\D/g, '');
      if (!rawStr) {
        setDisplayValue('');
        onChange({ target: { value: '' } });
        return;
      }
      const num = parseInt(rawStr, 10);
      setDisplayValue(num.toLocaleString('en-US'));
      onChange({ target: { value: num.toString() } });
    } else {
      // Auto-decimal logic for non-VND
      const digits = val.replace(/\D/g, '');
      if (!digits) {
        onChange({ target: { value: '' } });
        return;
      }
      const num = parseInt(digits, 10) / 100;
      const rawStr = num.toFixed(2);
      // For auto-decimal, we rely on useEffect for setting displayValue
      // because numerical normalization is simpler there.
      onChange({ target: { value: rawStr } });
    }
  };

  const showConversion = currency && currency !== 'VND' && rate && value;
  const convertedValue = showConversion ? Number(String(value).replace(',', '.')) * rate : 0;

  return (
    <div className="w-full">
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        className={className}
        {...props}
      />
      {showConversion && (
        <p className="mt-1.5 ml-1 text-[11px] font-medium text-indigo-500 animate-in fade-in slide-in-from-top-1 duration-200">
          ≈ {Math.round(convertedValue).toLocaleString('en-US')} VND
        </p>
      )}
    </div>
  );
}
