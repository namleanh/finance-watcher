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
      // VND: No decimals by default, use standard formatting
      const parts = String(val).split('.');
      let intPart = parts[0].replace(/\D/g, '');
      if (intPart) {
        intPart = Number(intPart).toLocaleString('en-US');
      }
      const decPart = parts.length > 1 ? '.' + parts[1].replace(/\D/g, '') : '';
      return intPart + decPart;
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
      // Standard VND logic
      if (val.endsWith(',') && !val.includes('.')) {
        val = val.slice(0, -1) + '.';
      }
      let rawStr = val.replace(/,/g, '');
      rawStr = rawStr.replace(/[^0-9.]/g, '');
      const parts = rawStr.split('.');
      if (parts.length > 2) {
        rawStr = parts[0] + '.' + parts.slice(1).join('');
      }

      // Update displayValue immediately for better UX
      const finalParts = rawStr.split('.');
      let intPart = finalParts[0] || '';
      if (intPart) {
        intPart = Number(intPart).toLocaleString('en-US');
      }
      
      if (rawStr.endsWith('.')) {
        setDisplayValue(intPart + '.');
      } else {
        const decPart = finalParts.length > 1 ? '.' + finalParts[1] : '';
        setDisplayValue(intPart ? intPart + decPart : '');
      }
      onChange({ target: { value: rawStr } });
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
          ≈ {convertedValue.toLocaleString('en-US')} VND
        </p>
      )}
    </div>
  );
}
