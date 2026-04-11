import React, { useState, useMemo, useEffect } from 'react';
import { useMarketFavorites, useRefreshMarketData, useToggleMarketPreference } from '@/hooks/api/useMarketData';
import { RefreshCw, DollarSign, Gem, TrendingUp, Plus, X, Calculator, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const ADDABLE_ITEMS = [
  { symbol: 'SJC', type: 'GOLD', label: 'Vàng SJC' },
  { symbol: 'RING', type: 'GOLD', label: 'Vàng Nhẫn' },
  { symbol: 'USD', type: 'CURRENCY', label: 'USD' },
  { symbol: 'MYR', type: 'CURRENCY', label: 'MYR' },
  { symbol: 'EUR', type: 'CURRENCY', label: 'EUR' },
  { symbol: 'JPY', type: 'CURRENCY', label: 'JPY' },
  { symbol: 'GBP', type: 'CURRENCY', label: 'GBP' },
  { symbol: 'AUD', type: 'CURRENCY', label: 'AUD' },
  { symbol: 'SGD', type: 'CURRENCY', label: 'SGD' },
  { symbol: 'KRW', type: 'CURRENCY', label: 'KRW' },
];

export default function MarketDataWidget() {
  const { data: items, isLoading, isError } = useMarketFavorites();
  const { mutate: refresh, isPending: isRefreshing } = useRefreshMarketData();
  const { mutate: togglePreference } = useToggleMarketPreference();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculator State
  const [calcPrice, setCalcPrice] = useState<number>(0);
  const [calcQuantity, setCalcQuantity] = useState<number | string>(1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const calculateTotal = () => {
    const price = Number(calcPrice) || 0;
    const qty = Number(calcQuantity) || 0;
    return price * qty;
  };

  const handlePriceClick = (price: number) => {
    setCalcPrice(price);
    // Auto expand if user clicks a price to calculate
    if (!isExpanded) setIsExpanded(true);
  };

  // Generate options for the dropdown
  const calculatorOptions = useMemo(() => {
    if (!items) return [];
    return items.map(item => ({
      label: item.label || item.symbol,
      price: Number(item.price),
      symbol: item.symbol
    })).sort((a, b) => {
      const isGoldA = a.symbol.includes('SJC') || a.symbol.includes('RING');
      const isGoldB = b.symbol.includes('SJC') || b.symbol.includes('RING');
      if (isGoldA && !isGoldB) return -1;
      if (!isGoldA && isGoldB) return 1;
      return 0;
    });
  }, [items]);

  // Sync calcPrice with MYR or first available item if not set
  useEffect(() => {
    if (calculatorOptions.length > 0 && calcPrice === 0) {
      const myr = calculatorOptions.find(o => o.symbol === 'MYR');
      if (myr) setCalcPrice(myr.price);
      else setCalcPrice(calculatorOptions[0].price);
    }
  }, [calculatorOptions, calcPrice]);

  if (isLoading) return (
    <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-center min-h-[140px]">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-medium text-slate-400">Đang tải dữ liệu thị trường...</span>
      </div>
    </div>
  );

  if (isError) return null;

  const currencies = items?.filter(i => i.type === 'CURRENCY') || [];

  const renderGoldCard = (type: 'SJC' | 'RING', title: string) => {
    const buy = items?.find(i => i.symbol === `${type}_BUY`);
    const sell = items?.find(i => i.symbol === `${type}_SELL`);
    if (!buy && !sell) return null;

    return (
      <div key={type} className="min-w-[150px] h-32 p-3 rounded-2xl bg-white dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all shrink-0 flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gem size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="text-[15px] font-bold text-amber-800 dark:text-amber-200 uppercase tracking-widest">{title}</span>
          </div>
          <button 
            onClick={() => {
              togglePreference({ symbol: `${type}_BUY`, type: 'GOLD' });
              togglePreference({ symbol: `${type}_SELL`, type: 'GOLD' });
            }}
            className="p-1 rounded bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          >
            <X size={10} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={() => buy && handlePriceClick(Number(buy.price))}
            className="flex justify-between items-center bg-white dark:bg-white/5 px-2.5 py-2 rounded-lg border border-amber-100 dark:border-white/5 hover:bg-amber-100 dark:hover:bg-white/10 active:scale-95 transition-all text-left"
          >
            <span className="text-[10px] text-amber-600 dark:text-slate-500 font-bold">MUA</span>
            <span className="text-[12px] font-bold text-slate-900 dark:text-white tracking-tight">{buy ? formatPrice(Number(buy.price)) : '--'}</span>
          </button>
          <button 
            onClick={() => sell && handlePriceClick(Number(sell.price))}
            className="flex justify-between items-center bg-white dark:bg-white/5 px-2.5 py-2 rounded-lg border border-amber-100 dark:border-white/5 hover:bg-amber-100 dark:hover:bg-white/10 active:scale-95 transition-all text-left"
          >
            <span className="text-[10px] text-amber-600 dark:text-slate-500 font-bold">BÁN</span>
            <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{sell ? formatPrice(Number(sell.price)) : '--'}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderForexCard = (item: any) => (
    <button 
      key={item.symbol} 
      onClick={() => handlePriceClick(Number(item.price))}
      className="min-w-[130px] h-32 relative p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md hover:border-indigo-500/20 hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all group text-left shrink-0 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <DollarSign size={14} />
          </div>
          <span className="text-[15px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">{item.symbol}</span>
        </div>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            togglePreference({ symbol: item.symbol, type: 'CURRENCY' });
          }}
          className="p-1 rounded opacity-0 group-hover:opacity-100 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-100 transition-all cursor-pointer"
        >
          <X size={10} />
        </div>
      </div>
      <div className="text-[13px] font-black text-slate-900 dark:text-white tracking-tighter mt-auto">
        {formatPrice(Number(item.price))}
      </div>
    </button>
  );

  const renderMicroCard = (item: any) => {
    const isGold = item.symbol.includes('SJC') || item.symbol.includes('RING');
    const displaySymbol = item.symbol.replace('_SELL', '').replace('_BUY', '');
    
    return (
      <div 
        key={item.symbol}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border shrink-0 transition-all animate-in fade-in zoom-in-95 duration-500 ${
          isGold 
            ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400' 
            : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-700 dark:text-indigo-400'
        }`}
      >
        <span className="text-[7px] font-black uppercase tracking-tighter opacity-70">{displaySymbol}</span>
        <span className="text-[9px] font-black tracking-tight">{formatPrice(Number(item.price))}</span>
      </div>
    );
  };

  const lastUpdated = items?.[0] ? format(new Date(items[0].updatedAt), 'HH:mm') : '--:--';

  return (
    <div className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 transition-all duration-300">
      <div 
        className="px-6 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <TrendingUp size={14} />
          </div>
          <div className={`${!isExpanded ? 'hidden sm:block' : ''}`}>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Giá vàng và Tỷ giá</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[8px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tighter">Cập nhật: {lastUpdated}</p>
            </div>
          </div>
        </div>

        {!isExpanded && items && items.length > 0 && (
          <div className="flex flex-1 items-center gap-2 px-2 sm:px-6 overflow-x-auto no-scrollbar mask-fade-right">
            {items
              .filter(item => !item.symbol.includes('_BUY')) // Filter out buy prices to keep it clean
              .map(renderMicroCard)}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); refresh(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <div className="p-1 rounded-lg text-slate-400">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-4 pt-1 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
            <button 
              onClick={() => setShowAddMenu(true)}
              className="flex flex-col items-center justify-center gap-2 p-3 min-w-[100px] h-32 rounded-2xl bg-white dark:bg-white/[0.01] border border-dashed border-slate-300 dark:border-white/5 hover:border-indigo-500/40 hover:bg-slate-50 transition-all shrink-0 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-transparent">
                <Plus className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thêm</span>
            </button>

            {renderGoldCard('SJC', 'Vàng SJC')}
            {renderGoldCard('RING', 'Vàng Nhẫn')}
            {currencies.map(renderForexCard)}
          </div>

          {/* Ultra-Compact Calculator Ribbon */}
          <div className="mt-2 pt-3 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-100 dark:bg-white/5 text-slate-500 flex-shrink-0">
                  <Calculator size={10} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Quy đổi:</span>
              </div>
              
              <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden h-7 w-full sm:w-auto">
                <input 
                  type="text" 
                  value={calcQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (/^\d*$/.test(val) && Number(val) <= 999999999)) {
                      setCalcQuantity(val);
                    }
                  }}
                  className="h-full px-2 bg-transparent text-[10px] text-slate-900 dark:text-white focus:outline-none font-bold text-center transition-all"
                  style={{ width: `${Math.max(32, String(calcQuantity).length * 8 + 16)}px` }}
                  placeholder="SL"
                />
                <select
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value))}
                  className="bg-transparent h-full px-2 text-[10px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-white/5 focus:outline-none cursor-pointer font-medium min-w-[140px] flex-1 dark:[color-scheme:dark]"
                >
                  {calculatorOptions.map(opt => (
                    <option key={opt.symbol} value={opt.price} className="dark:bg-slate-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hidden sm:block text-slate-300 dark:text-slate-800 shrink-0">
              <ArrowRight size={12} />
            </div>

            <div className="flex items-center justify-between gap-3 px-3 py-1 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-lg border border-indigo-500/10 h-7 w-full sm:w-auto sm:min-w-[160px] shrink-0">
              <span className="text-[10px] font-bold text-indigo-600/50 dark:text-indigo-400/50 uppercase tracking-widest">Thành tiền</span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-tight whitespace-nowrap">
                {formatPrice(calculateTotal())} <span className="text-[8px] ml-0.5 opacity-50">VND</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Modal */}
      {showAddMenu && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          onClick={() => setShowAddMenu(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <h4 className="text-sm font-bold text-white uppercase">Thêm ngoại tệ</h4>
              <button onClick={() => setShowAddMenu(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto no-scrollbar grid grid-cols-1 gap-1.5">
              {ADDABLE_ITEMS
                .filter(item => {
                  if (item.type === 'GOLD') {
                    // Check if either buy or sell is missing
                    return !items?.find(i => i.symbol === `${item.symbol}_BUY`);
                  }
                  return !items?.find(i => i.symbol === item.symbol);
                })
                .map(item => (
                  <button
                    key={item.symbol}
                    onClick={() => { 
                      if (item.type === 'GOLD') {
                        togglePreference({ symbol: `${item.symbol}_BUY`, type: 'GOLD' });
                        togglePreference({ symbol: `${item.symbol}_SELL`, type: 'GOLD' });
                      } else {
                        togglePreference({ symbol: item.symbol, type: 'CURRENCY' });
                      }
                      setShowAddMenu(false); 
                    }}
                    className="w-full px-5 py-4 text-left hover:bg-white/5 flex items-center justify-between group rounded-2xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                        item.type === 'GOLD' ? 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500' : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500'
                      } group-hover:text-white`}>
                        {item.type === 'GOLD' ? <Gem size={18} /> : item.symbol.substring(0, 1)}
                      </div>
                      <div>
                        <span className="text-[15px] font-bold text-slate-300 group-hover:text-white block">{item.label}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{item.type === 'GOLD' ? 'Vàng' : 'Ngoại tệ'}</span>
                      </div>
                    </div>
                    <Plus size={18} className="text-slate-600 group-hover:text-indigo-400" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
