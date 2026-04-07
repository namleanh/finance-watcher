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
    // Replace anything that is not a digit or a dot
    let rawStr = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one dot exists
    const parts = rawStr.split('.');
    if (parts.length > 2) {
      rawStr = parts[0] + '.' + parts.slice(1).join('');
    }

    let intPart = parts[0] || '';
    if (intPart) {
      intPart = Number(intPart).toLocaleString('en-US');
    }
    
    if (rawStr.endsWith('.')) {
      setDisplayValue(intPart + '.');
    } else {
      const decPart = parts.length > 1 ? '.' + parts[1] : '';
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
