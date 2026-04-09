import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string | number;
  onChange: (e: { target: { value: string } }) => void;
  currency?: string;
  rate?: number;
}

export default function CurrencyInput({ value, onChange, className, currency, rate, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setDisplayValue('');
      return;
    }
    const strVal = String(value);
    
    if (strVal.endsWith('.')) return;

    const parts = strVal.split('.');
    let intPart = parts[0].replace(/\D/g, ''); 
    if (intPart) {
      intPart = Number(intPart).toLocaleString('en-US');
    }
    const decPart = parts.length > 1 ? '.' + parts[1].replace(/\D/g, '') : '';
    setDisplayValue(intPart ? intPart + decPart : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    const isTrailingComma = val.endsWith(',');
    let rawStr = val;
    if (isTrailingComma) {
      rawStr = val.slice(0, -1) + '.';
    } else {
      const commaCount = (val.match(/,/g) || []).length;
      const dotCount = (val.match(/\./g) || []).length;
      if (commaCount === 1 && dotCount === 0) {
        rawStr = val.replace(',', '.');
      }
    }

    rawStr = rawStr.replace(/[^0-9.]/g, '');
    const parts = rawStr.split('.');
    if (parts.length > 2) {
      rawStr = parts[0] + '.' + parts.slice(1).join('');
    }

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
          ≈ {convertedValue.toLocaleString('vi-VN')} VND
        </p>
      )}
    </div>
  );
}
