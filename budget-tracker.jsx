import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, Upload, X, FileSpreadsheet, ChevronRight, AlertCircle, Pencil, Check, Calendar, Clock, Sparkles, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import * as Papa from 'papaparse';

export default function BudgetTracker() {
  const [currentDate] = useState(new Date());
  const [startingBalance, setStartingBalance] = useState(1000);
  const [transactions, setTransactions] = useState([
    { id: 1, date: 5, type: 'income', amount: 2500, description: 'Salary', status: 'actual' },
    { id: 2, date: 8, type: 'expense', amount: 150, description: 'Utilities', status: 'actual' },
    { id: 3, date: 12, type: 'expense', amount: 400, description: 'Groceries', status: 'actual' },
    { id: 4, date: 20, type: 'income', amount: 2500, description: 'Salary (Expected)', status: 'forecast' },
    { id: 5, date: 25, type: 'expense', amount: 800, description: 'Rent', status: 'forecast' },
  ]);

  const [newTransaction, setNewTransaction] = useState({
    date: currentDate.getDate(),
    type: 'expense',
    amount: '',
    description: '',
    status: 'actual'
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ date: 1, type: 'expense', amount: '', description: '', status: 'actual' });
  const [selectedDay, setSelectedDay] = useState(null);
  const transactionRefs = useRef({});
  const [showImport, setShowImport] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [csvData, setCsvData] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({ date: '', amount: '', description: '', type: '' });
  const [mappedTransactions, setMappedTransactions] = useState([]);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = currentDate.getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const chartData = useMemo(() => {
    const data = [];
    let runningActualBalance = startingBalance;
    let runningForecastBalance = startingBalance;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = transactions.filter(t => t.date === day);
      const actualTransactions = dayTransactions.filter(t => t.status === 'actual');
      const forecastTransactions = dayTransactions.filter(t => t.status === 'forecast');

      const actualIncome = actualTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const actualExpense = actualTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const forecastIncome = forecastTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const forecastExpense = forecastTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      runningActualBalance += actualIncome - actualExpense;
      runningForecastBalance += (actualIncome + forecastIncome) - (actualExpense + forecastExpense);

      data.push({
        day,
        actual: runningActualBalance,
        forecast: forecastTransactions.length > 0 || day > today ? runningForecastBalance : null,
        hasActualTransactions: actualTransactions.length > 0,
        hasForecastTransactions: forecastTransactions.length > 0,
        actualCount: actualTransactions.length,
        forecastCount: forecastTransactions.length
      });
    }
    return data;
  }, [transactions, startingBalance, daysInMonth, today]);

  const stats = useMemo(() => {
    const actualTransactions = transactions.filter(t => t.status === 'actual');
    const forecastTransactions = transactions.filter(t => t.status === 'forecast');
    const actualIncome = actualTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const actualExpenses = actualTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const forecastIncome = forecastTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const forecastExpenses = forecastTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = startingBalance + actualIncome - actualExpenses;
    const projectedEnd = currentBalance + forecastIncome - forecastExpenses;
    return { actualIncome, actualExpenses, forecastIncome, forecastExpenses, currentBalance, projectedEnd };
  }, [transactions, startingBalance]);

  useEffect(() => {
    if (selectedDay !== null) {
      const firstTransactionForDay = transactions.find(t => t.date === selectedDay);
      if (firstTransactionForDay && transactionRefs.current[firstTransactionForDay.id]) {
        transactionRefs.current[firstTransactionForDay.id].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedDay, transactions]);

  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) return;
    setTransactions([...transactions, { id: Date.now(), ...newTransaction, amount: parseFloat(newTransaction.amount) }]);
    setNewTransaction({ date: today, type: 'expense', amount: '', description: '', status: 'actual' });
  };

  const removeTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const startEditing = (transaction) => {
    setEditingId(transaction.id);
    setEditForm({ date: transaction.date, type: transaction.type, amount: transaction.amount.toString(), description: transaction.description, status: transaction.status });
  };

  const saveEdit = () => {
    if (!editForm.amount || !editForm.description) return;
    setTransactions(prev => prev.map(t => t.id === editingId ? { ...t, ...editForm, amount: parseFloat(editForm.amount) } : t));
    setEditingId(null);
  };

  const handleTransactionClick = (day) => {
    if (editingId) return;
    setSelectedDay(prev => prev === day ? null : day);
  };

  const handleChartClick = (data) => {
    if (editingId) return;
    if (data?.activePayload?.[0]?.payload) {
      const clickedDay = data.activePayload[0].payload.day;
      if (transactions.some(t => t.date === clickedDay)) {
        setSelectedDay(prev => prev === clickedDay ? null : clickedDay);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError('');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) { setImportError('Error parsing CSV file.'); return; }
        setCsvData(results.data);
        setCsvHeaders(results.meta.fields || []);
        const headers = results.meta.fields || [];
        const autoMapping = { date: '', amount: '', description: '', type: '' };
        headers.forEach(h => {
          const lower = h.toLowerCase();
          if (lower.includes('date') && !autoMapping.date) autoMapping.date = h;
          if ((lower === 'amount' || lower.includes('money')) && !autoMapping.amount) autoMapping.amount = h;
          if ((lower.includes('name') || lower.includes('description') || lower === 'merchant') && !autoMapping.description) autoMapping.description = h;
          if (lower === 'type' || lower === 'category') autoMapping.type = h;
        });
        setColumnMapping(autoMapping);
        setImportStep(2);
      },
      error: () => setImportError('Failed to read the file.')
    });
  };

  const processMapping = () => {
    if (!columnMapping.date || !columnMapping.amount || !columnMapping.description) {
      setImportError('Please map all required fields'); return;
    }
    setImportError('');
    const processed = csvData.map((row, index) => {
      const dateStr = row[columnMapping.date];
      let day = today;
      if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime()) && parsed.getMonth() === month && parsed.getFullYear() === year) {
          day = parsed.getDate();
        } else {
          const parts = dateStr.split(/[\/\-]/);
          if (parts.length === 3) {
            const d = parseInt(parts[0]), m = parseInt(parts[1]) - 1, y = parseInt(parts[2].length === 2 ? '20' + parts[2] : parts[2]);
            if (m === month && y === year && d >= 1 && d <= daysInMonth) day = d;
          }
        }
      }
      let amountStr = (row[columnMapping.amount] || '0').replace(/[£$€,]/g, '').trim();
      const amount = parseFloat(amountStr) || 0;
      let type = 'expense';
      if (columnMapping.type && row[columnMapping.type]) {
        const typeVal = row[columnMapping.type].toLowerCase();
        if (typeVal.includes('income') || typeVal.includes('credit') || typeVal.includes('salary')) type = 'income';
      } else { type = amount >= 0 ? 'income' : 'expense'; }
      return { id: Date.now() + index, date: day, amount: Math.abs(amount), description: row[columnMapping.description] || 'Imported', type, status: 'actual', selected: true };
    }).filter(t => t.amount > 0);
    setMappedTransactions(processed);
    setImportStep(3);
  };

  const importTransactions = () => {
    const toImport = mappedTransactions.filter(t => t.selected).map(({ selected, ...t }) => t);
    setTransactions(prev => [...prev, ...toImport]);
    resetImport();
  };

  const resetImport = () => {
    setShowImport(false); setImportStep(1); setCsvData(null); setCsvHeaders([]);
    setColumnMapping({ date: '', amount: '', description: '', type: '' });
    setMappedTransactions([]); setImportError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const CustomDot = (props) => {
    const { cx, cy, payload, dataKey } = props;
    const isActual = dataKey === 'actual';
    const hasTransactions = isActual ? payload.hasActualTransactions : payload.hasForecastTransactions;
    if (!hasTransactions || cx === undefined || cy === undefined) return null;
    const isSelected = selectedDay === payload.day;
    const count = isActual ? payload.actualCount : payload.forecastCount;

    return (
      <g style={{ cursor: 'pointer' }}>
        {isSelected && <circle cx={cx} cy={cy} r={16} fill={isActual ? '#14b8a6' : '#a78bfa'} opacity={0.2} />}
        <circle cx={cx} cy={cy} r={isSelected ? 10 : 7} fill={isSelected ? '#fbbf24' : isActual ? '#14b8a6' : '#a78bfa'}
          stroke={isSelected ? '#f59e0b' : isActual ? '#0d9488' : '#8b5cf6'} strokeWidth={2.5}
          strokeDasharray={isActual ? '0' : '4 2'} />
        {count > 1 && <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={9} fontWeight="600">{count}</text>}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    const dayTx = transactions.filter(t => t.date === label);
    const actualTx = dayTx.filter(t => t.status === 'actual');
    const forecastTx = dayTx.filter(t => t.status === 'forecast');

    return (
      <div className="backdrop-blur-xl bg-slate-900/90 p-4 rounded-2xl shadow-2xl border border-slate-600/40 min-w-48">
        <p className="font-semibold text-white text-lg mb-2">{monthName} {label}</p>
        {payload.map((p, i) => p.value !== null && (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-300 text-sm">{p.name}:</span>
            <span className="text-white font-medium">£{p.value.toLocaleString()}</span>
          </div>
        ))}
        {actualTx.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-600/40">
            <p className="text-xs font-medium text-teal-400 mb-2 flex items-center gap-1.5"><Calendar size={11} />Actual</p>
            {actualTx.map(t => (
              <div key={t.id} className="flex justify-between text-sm mb-1">
                <span className="text-slate-400 truncate max-w-24">{t.description}</span>
                <span className={t.type === 'income' ? 'text-teal-400' : 'text-rose-400'}>{t.type === 'income' ? '+' : '-'}£{t.amount}</span>
              </div>
            ))}
          </div>
        )}
        {forecastTx.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-600/40">
            <p className="text-xs font-medium text-violet-400 mb-2 flex items-center gap-1.5"><Clock size={11} />Forecast</p>
            {forecastTx.map(t => (
              <div key={t.id} className="flex justify-between text-sm mb-1">
                <span className="text-slate-500 truncate max-w-24">{t.description}</span>
                <span className={t.type === 'income' ? 'text-teal-400/60' : 'text-rose-400/60'}>{t.type === 'income' ? '+' : '-'}£{t.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Shared card style with subtle light border
  const cardClass = "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/50 backdrop-blur-sm border border-slate-500/20 shadow-lg shadow-black/10";
  const cardHoverClass = "hover:border-slate-400/30 hover:shadow-xl hover:shadow-black/20 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Gradient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-white/10">
                <Wallet size={20} className="text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Budget Tracker
              </h1>
            </div>
            <p className="text-slate-500 text-sm sm:text-base pl-13">{monthName} {year}</p>
          </div>
          <button onClick={() => setShowImport(true)}
            className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 bg-slate-800/60 backdrop-blur-sm border border-slate-500/25 hover:border-slate-400/40 hover:bg-slate-700/60 shadow-md shadow-black/10`}>
            <Upload size={16} className="text-slate-400 group-hover:text-teal-400 transition-colors" />
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Import CSV</span>
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Starting Balance */}
          <div className={`group ${cardClass} ${cardHoverClass} p-4 sm:p-5`}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm mb-3">
                <Wallet size={14} />
                <span>Starting Balance</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">£</span>
                <input type="number" value={startingBalance} onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-white bg-transparent outline-none w-full" />
              </div>
            </div>
          </div>

          {/* Income */}
          <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950/40 to-slate-900/50 backdrop-blur-sm border border-teal-400/20 shadow-lg shadow-teal-900/20 hover:border-teal-400/35 hover:shadow-xl hover:shadow-teal-900/30 transition-all duration-300 p-4 sm:p-5`}>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 text-teal-400/80 text-xs sm:text-sm mb-3">
                <ArrowUpRight size={14} />
                <span>Income</span>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-400">£{stats.actualIncome.toLocaleString()}</p>
              {stats.forecastIncome > 0 && (
                <p className="text-xs text-teal-500/60 mt-1.5 flex items-center gap-1">
                  <Sparkles size={10} />+£{stats.forecastIncome.toLocaleString()} forecast
                </p>
              )}
            </div>
          </div>

          {/* Expenses */}
          <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900/50 backdrop-blur-sm border border-rose-400/20 shadow-lg shadow-rose-900/20 hover:border-rose-400/35 hover:shadow-xl hover:shadow-rose-900/30 transition-all duration-300 p-4 sm:p-5`}>
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 text-rose-400/80 text-xs sm:text-sm mb-3">
                <ArrowDownRight size={14} />
                <span>Expenses</span>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-rose-400">£{stats.actualExpenses.toLocaleString()}</p>
              {stats.forecastExpenses > 0 && (
                <p className="text-xs text-rose-500/60 mt-1.5 flex items-center gap-1">
                  <Sparkles size={10} />+£{stats.forecastExpenses.toLocaleString()} forecast
                </p>
              )}
            </div>
          </div>

          {/* Projected */}
          <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950/40 to-slate-900/50 backdrop-blur-sm border border-violet-400/20 shadow-lg shadow-violet-900/20 hover:border-violet-400/35 hover:shadow-xl hover:shadow-violet-900/30 transition-all duration-300 p-4 sm:p-5`}>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 text-violet-400/80 text-xs sm:text-sm mb-3">
                <TrendingUp size={14} />
                <span>Projected</span>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-violet-400">£{stats.projectedEnd.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1.5">Current: £{stats.currentBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Selected Day Banner */}
        {selectedDay !== null && (
          <div className="mb-4 flex items-center justify-between bg-amber-500/10 border border-amber-400/30 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg shadow-amber-900/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-400/50" />
              <span className="text-amber-200 text-sm">Viewing <span className="font-semibold">{monthName} {selectedDay}</span></span>
            </div>
            <button onClick={() => setSelectedDay(null)} className="text-amber-400/80 hover:text-amber-300 transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Chart */}
        <div className={`${cardClass} p-4 sm:p-6 mb-6`}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/25 to-transparent" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Balance Overview</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Click points to view transactions</p>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-400 shadow-md shadow-teal-400/30" />
                <span className="text-slate-400">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-violet-400 border-dashed" />
                <span className="text-slate-400">With Forecast</span>
              </div>
            </div>
          </div>
          <div className="h-56 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} onClick={handleChartClick}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
                  tickFormatter={(val) => `£${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeDasharray: '4 4' }} />
                {selectedDay !== null && <ReferenceLine x={selectedDay} stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 4" />}
                <ReferenceLine x={today} stroke="#475569" strokeDasharray="4 4"
                  label={{ value: 'Today', position: 'top', fill: '#64748b', fontSize: 11 }} />
                <ReferenceLine y={0} stroke="#ef4444" strokeOpacity={0.3} strokeDasharray="4 4" />
                <Area type="monotone" dataKey="actual" stroke="#14b8a6" strokeWidth={2.5} fill="url(#actualGrad)"
                  dot={<CustomDot dataKey="actual" />} activeDot={{ fill: '#14b8a6', r: 6, stroke: '#0d9488', strokeWidth: 2 }}
                  name="Actual" connectNulls={true} />
                <Area type="monotone" dataKey="forecast" stroke="#a78bfa" strokeWidth={2} strokeDasharray="6 4"
                  fill="url(#forecastGrad)" dot={<CustomDot dataKey="forecast" />}
                  activeDot={{ fill: '#a78bfa', r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                  name="With Forecast" connectNulls={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Form and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Transaction */}
          <div className={`${cardClass} p-5 sm:p-6`}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/25 to-transparent" />
            <h2 className="text-lg font-semibold text-white mb-5">Add Transaction</h2>
            <div className="space-y-4">
              {/* Status Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-800/60 rounded-xl border border-slate-600/20">
                <button onClick={() => setNewTransaction({ ...newTransaction, status: 'actual' })}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${newTransaction.status === 'actual'
                      ? 'bg-teal-500/20 text-teal-400 shadow-lg shadow-teal-500/10 border border-teal-400/30'
                      : 'text-slate-400 hover:text-slate-300 border border-transparent'
                    }`}>
                  <Calendar size={14} /> Actual
                </button>
                <button onClick={() => setNewTransaction({ ...newTransaction, status: 'forecast' })}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${newTransaction.status === 'forecast'
                      ? 'bg-violet-500/20 text-violet-400 shadow-lg shadow-violet-500/10 border border-violet-400/30'
                      : 'text-slate-400 hover:text-slate-300 border border-transparent'
                    }`}>
                  <Clock size={14} /> Forecast
                </button>
              </div>

              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-800/60 rounded-xl border border-slate-600/20">
                <button onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${newTransaction.type === 'income'
                      ? 'bg-teal-500/20 text-teal-400 shadow-lg shadow-teal-500/10 border border-teal-400/30'
                      : 'text-slate-400 hover:text-slate-300 border border-transparent'
                    }`}>
                  Income
                </button>
                <button onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${newTransaction.type === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/10 border border-rose-400/30'
                      : 'text-slate-400 hover:text-slate-300 border border-transparent'
                    }`}>
                  Expense
                </button>
              </div>

              {/* Date and Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 ml-1">Day</label>
                  <select value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: parseInt(e.target.value) })}
                    className="w-full p-3 bg-slate-800/60 border border-slate-500/25 rounded-xl text-white text-sm focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 transition-all hover:border-slate-400/40">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{monthName.slice(0, 3)} {day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 ml-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                    <input type="number" inputMode="decimal" placeholder="0.00" value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      className="w-full p-3 pl-7 bg-slate-800/60 border border-slate-500/25 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 transition-all hover:border-slate-400/40" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 ml-1">Description</label>
                <input type="text" placeholder="e.g., Salary, Groceries" value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full p-3 bg-slate-800/60 border border-slate-500/25 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 transition-all hover:border-slate-400/40" />
              </div>

              {/* Submit */}
              <button onClick={addTransaction}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 border ${newTransaction.status === 'forecast'
                    ? 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/25 border-violet-400/30'
                    : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg shadow-teal-500/25 border-teal-400/30'
                  }`}>
                <Plus size={18} />
                Add {newTransaction.status === 'forecast' ? 'Forecast' : 'Transaction'}
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className={`${cardClass} p-5 sm:p-6`}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-400/25 to-transparent" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Transactions</h2>
                <p className="text-slate-500 text-xs mt-0.5">Click to highlight • Edit inline</p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-600/20">{transactions.length} items</span>
            </div>

            <div className="space-y-2 max-h-96 lg:max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-600/20 flex items-center justify-center mx-auto mb-3">
                    <FileSpreadsheet size={20} className="text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm">No transactions yet</p>
                </div>
              ) : (
                transactions.sort((a, b) => a.date - b.date).map(t => {
                  const isHighlighted = selectedDay === t.date;
                  const isForecast = t.status === 'forecast';

                  if (editingId === t.id) {
                    return (
                      <div key={t.id} className="p-4 bg-slate-800/80 rounded-xl border-2 border-teal-400/50 shadow-lg shadow-teal-900/20 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => setEditForm({ ...editForm, status: 'actual' })}
                            className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${editForm.status === 'actual' ? 'bg-teal-500/20 text-teal-400 border-teal-400/30' : 'bg-slate-700/50 text-slate-400 border-transparent'
                              }`}>
                            <Calendar size={12} /> Actual
                          </button>
                          <button onClick={() => setEditForm({ ...editForm, status: 'forecast' })}
                            className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${editForm.status === 'forecast' ? 'bg-violet-500/20 text-violet-400 border-violet-400/30' : 'bg-slate-700/50 text-slate-400 border-transparent'
                              }`}>
                            <Clock size={12} /> Forecast
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => setEditForm({ ...editForm, type: 'income' })}
                            className={`py-2 rounded-lg text-xs font-medium border ${editForm.type === 'income' ? 'bg-teal-500/20 text-teal-400 border-teal-400/30' : 'bg-slate-700/50 text-slate-400 border-transparent'}`}>
                            Income
                          </button>
                          <button onClick={() => setEditForm({ ...editForm, type: 'expense' })}
                            className={`py-2 rounded-lg text-xs font-medium border ${editForm.type === 'expense' ? 'bg-rose-500/20 text-rose-400 border-rose-400/30' : 'bg-slate-700/50 text-slate-400 border-transparent'}`}>
                            Expense
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: parseInt(e.target.value) })}
                            className="p-2.5 bg-slate-700/50 border border-slate-500/30 rounded-lg text-white text-sm">
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                              <option key={day} value={day}>{monthName.slice(0, 3)} {day}</option>
                            ))}
                          </select>
                          <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="p-2.5 bg-slate-700/50 border border-slate-500/30 rounded-lg text-white text-sm" placeholder="Amount" />
                        </div>
                        <input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full p-2.5 bg-slate-700/50 border border-slate-500/30 rounded-lg text-white text-sm" placeholder="Description" />
                        <div className="flex gap-2">
                          <button onClick={saveEdit}
                            className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors border border-teal-400/30">
                            <Check size={14} /> Save
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-500/30">
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={t.id} ref={el => transactionRefs.current[t.id] = el} onClick={() => handleTransactionClick(t.date)}
                      className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${isHighlighted
                          ? 'bg-amber-500/10 border-2 border-amber-400/40 ring-2 ring-amber-400/20 shadow-lg shadow-amber-900/20'
                          : isForecast
                            ? 'bg-violet-950/20 border border-violet-400/20 border-dashed hover:bg-violet-950/30 hover:border-violet-400/35'
                            : 'bg-slate-800/30 border border-slate-500/15 hover:bg-slate-800/50 hover:border-slate-400/30'
                        }`}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${t.type === 'income'
                            ? isForecast ? 'bg-teal-500/10 border-teal-400/20' : 'bg-teal-500/20 border-teal-400/30'
                            : isForecast ? 'bg-rose-500/10 border-rose-400/20' : 'bg-rose-500/20 border-rose-400/30'
                          }`}>
                          {t.type === 'income'
                            ? <ArrowUpRight size={18} className={isForecast ? 'text-teal-400/50' : 'text-teal-400'} />
                            : <ArrowDownRight size={18} className={isForecast ? 'text-rose-400/50' : 'text-rose-400'} />
                          }
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm truncate ${isHighlighted ? 'text-amber-100' : isForecast ? 'text-slate-400' : 'text-white'}`}>
                              {t.description}
                            </p>
                            {isForecast && (
                              <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded-md font-medium border border-violet-400/20">
                                Forecast
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${isHighlighted ? 'text-amber-300/70' : 'text-slate-500'}`}>
                            {monthName.slice(0, 3)} {t.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className={`font-semibold text-sm ${t.type === 'income' ? isForecast ? 'text-teal-400/60' : 'text-teal-400'
                            : isForecast ? 'text-rose-400/60' : 'text-rose-400'
                          }`}>
                          {t.type === 'income' ? '+' : '-'}£{t.amount.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); startEditing(t); }}
                            className="p-1.5 text-slate-500 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all border border-transparent hover:border-teal-400/30">
                            <Pencil size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); removeTransaction(t.id); }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-400/30">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 w-full sm:w-auto sm:min-w-[420px] sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col border border-slate-600/30 shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-400/30">
                  <FileSpreadsheet className="text-teal-400" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Import CSV</h2>
                  <p className="text-xs text-slate-500">From your Monzo account</p>
                </div>
              </div>
              <button onClick={resetImport} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-600/30">
                <X size={18} />
              </button>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50">
              {[1, 2, 3].map(step => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all border ${importStep >= step ? 'bg-teal-500 text-white border-teal-400/50 shadow-lg shadow-teal-500/30' : 'bg-slate-800 text-slate-500 border-slate-600/30'
                    }`}>{step}</div>
                  {step < 3 && <div className={`flex-1 h-0.5 rounded-full ${importStep > step ? 'bg-teal-500' : 'bg-slate-700'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {importError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={16} />{importError}
                </div>
              )}

              {importStep === 1 && (
                <div className="text-center py-6">
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600/50 rounded-2xl p-10 cursor-pointer hover:border-teal-400/50 hover:bg-teal-500/5 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-600/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-500/10 group-hover:border-teal-400/30 transition-colors">
                      <Upload size={24} className="text-slate-500 group-hover:text-teal-400 transition-colors" />
                    </div>
                    <p className="text-white font-medium mb-1">Upload your CSV file</p>
                    <p className="text-slate-500 text-sm">Click to browse or drag and drop</p>
                  </div>
                  <p className="text-slate-600 text-xs mt-4">Export from Monzo → Account → Download statement</p>
                </div>
              )}

              {importStep === 2 && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">Map your CSV columns to import correctly.</p>
                  {[
                    { key: 'date', label: 'Date Column', required: true },
                    { key: 'amount', label: 'Amount Column', required: true },
                    { key: 'description', label: 'Description Column', required: true },
                    { key: 'type', label: 'Type Column', required: false }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm text-slate-400 mb-1.5">
                        {field.label}{field.required && <span className="text-rose-400 ml-1">*</span>}
                      </label>
                      <select value={columnMapping[field.key]} onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full p-3 bg-slate-800/60 border border-slate-500/25 rounded-xl text-white text-sm focus:outline-none focus:border-teal-400/50 hover:border-slate-400/40 transition-all">
                        <option value="">Select column...</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {importStep === 3 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 text-sm">{mappedTransactions.filter(t => t.selected).length} of {mappedTransactions.length} selected</p>
                    <button onClick={() => setMappedTransactions(prev => prev.map(t => ({ ...t, selected: !prev.every(p => p.selected) })))}
                      className="text-xs text-teal-400 hover:text-teal-300 px-2 py-1 rounded-lg hover:bg-teal-500/10 transition-all">Toggle all</button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {mappedTransactions.map(t => (
                      <div key={t.id} onClick={() => setMappedTransactions(prev => prev.map(p => p.id === t.id ? { ...p, selected: !p.selected } : p))}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${t.selected ? 'bg-slate-800/60 border-slate-500/25' : 'bg-slate-800/20 border-transparent opacity-50'}`}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${t.selected ? 'bg-teal-500 border-teal-400' : 'border-slate-600'
                          }`}>{t.selected && <Check size={12} className="text-white" />}</div>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${t.type === 'income' ? 'bg-teal-500/20 border-teal-400/30' : 'bg-rose-500/20 border-rose-400/30'}`}>
                          {t.type === 'income' ? <ArrowUpRight size={14} className="text-teal-400" /> : <ArrowDownRight size={14} className="text-rose-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{t.description}</p>
                          <p className="text-slate-500 text-xs">{monthName} {t.date}</p>
                        </div>
                        <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-teal-400' : 'text-rose-400'}`}>
                          {t.type === 'income' ? '+' : '-'}£{t.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-700/50 flex gap-3">
              {importStep > 1 && (
                <button onClick={() => setImportStep(prev => prev - 1)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-600/30 hover:border-slate-500/40">
                  Back
                </button>
              )}
              {importStep === 2 && (
                <button onClick={processMapping}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-medium transition-colors border border-teal-400/30 shadow-lg shadow-teal-500/20">
                  Continue
                </button>
              )}
              {importStep === 3 && (
                <button onClick={importTransactions} disabled={!mappedTransactions.some(t => t.selected)}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors border border-teal-400/30 shadow-lg shadow-teal-500/20">
                  Import {mappedTransactions.filter(t => t.selected).length} Transactions
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}
