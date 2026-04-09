import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string | number;
  onChange: (e: { target: { value: string } }) => void;
}

export default function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setDisplayValue('');
      return;
    }
    const strVal = String(value);
    
    // Keep trailing dot if user is currently typing a decimal
    if (strVal.endsWith('.')) {
      // do nothing, let the handleChange manage the view to avoid jumping
      return;
    }

    const parts = strVal.split('.');
    let intPart = parts[0].replace(/\D/g, ''); 
    if (intPart) {
      intPart = Number(intPart).toLocaleString('en-US'); // Will inject commas 1,000,000
    }
    const decPart = parts.length > 1 ? '.' + parts[1].replace(/\D/g, '') : '';
    setDisplayValue(intPart ? intPart + decPart : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Detect if user typed a comma as a decimal separator
    // Since we format with en-US (comma as thousands), this is tricky.
    // If the last character is a comma, we definitely treat it as a decimal point.
    const isTrailingComma = val.endsWith(',');
    const isTrailingDot = val.endsWith('.');

    // Normalize: replace comma with dot if it's clearly intended as a decimal
    // or if we want to support the user's request "allow comma for decimal".
    // Strategy: Remove all commas that were likely thousands separators from displayValue,
    // then if a comma remains or was just added, it's a decimal.
    
    // Simpler: If there's a comma and no dot, OR if the comma is the last char, treat it as dot.
    let rawStr = val;
    if (isTrailingComma) {
      rawStr = val.slice(0, -1) + '.';
    } else {
      // If user pasted or typed 1,55
      // If there's only one comma and no dot, it's a decimal.
      const commaCount = (val.match(/,/g) || []).length;
      const dotCount = (val.match(/\./g) || []).length;
      
      if (commaCount === 1 && dotCount === 0) {
        rawStr = val.replace(',', '.');
      }
    }

    // Now strip everything except digits and dot
    rawStr = rawStr.replace(/[^0-9.]/g, '');
    
    // Ensure only one dot exists
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

    // Call upstream onChange with the pure numeric string representation
    onChange({ target: { value: rawStr } });
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
}
