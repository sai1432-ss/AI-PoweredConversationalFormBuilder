import React, { useState, useMemo } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useFormStore } from './store/useFormStore';
import { MessageSquare, Layout, Download, Send, Loader2, Code, Copy, Terminal, Zap, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
/* ─────────────────────────────────────────────────────────────
   STYLES — injected once at module level
   ───────────────────────────────────────────────────────────── */
const FORM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  /* ── Reset & Base ── */
  .rjsf-beautiful * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

  /* ── Field wrapper ── */
  .rjsf-beautiful .form-group {
    margin-bottom: 0 !important;
    position: relative;
  }

  /* ── Hide RJSF's own auto-rendered labels (our template handles labels) ── */
  .rjsf-beautiful .form-group > label.control-label,
  .rjsf-beautiful label.control-label {
    display: none !important;
  }
  .rjsf-beautiful .required { color: #6366f1; margin-left: 2px; }

  /* ── Text inputs ── */
  .rjsf-beautiful input[type="text"],
  .rjsf-beautiful input[type="email"],
  .rjsf-beautiful input[type="password"],
  .rjsf-beautiful input[type="number"],
  .rjsf-beautiful input[type="tel"],
  .rjsf-beautiful input[type="url"],
  .rjsf-beautiful input[type="date"],
  .rjsf-beautiful textarea {
    width: 100%;
    padding: 0.78rem 1rem;
    font-size: 0.9rem;
    font-weight: 400;
    color: #0f172a;
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    appearance: none;
    -webkit-appearance: none;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .rjsf-beautiful input:hover,
  .rjsf-beautiful textarea:hover {
    border-color: #c7d2fe;
  }
  .rjsf-beautiful input:focus,
  .rjsf-beautiful textarea:focus {
    border-color: #6366f1;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12), 0 1px 2px rgba(0,0,0,0.04);
  }
  .rjsf-beautiful input::placeholder,
  .rjsf-beautiful textarea::placeholder { color: #cbd5e1; font-weight: 400; }

  /* ── Select ── */
  .rjsf-beautiful select {
    width: 100%;
    padding: 0.78rem 2.5rem 0.78rem 1rem;
    font-size: 0.9rem;
    font-weight: 400;
    color: #0f172a;
    background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 0.9rem center;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    outline: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .rjsf-beautiful select:hover { border-color: #c7d2fe; }
  .rjsf-beautiful select:focus {
    border-color: #6366f1;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }

  /* ── Checkbox ── */
  .rjsf-beautiful .checkbox { margin: 0.25rem 0; }
  .rjsf-beautiful .checkbox label {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    cursor: pointer;
    text-transform: none;
    letter-spacing: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
  }
  .rjsf-beautiful input[type="checkbox"] {
    width: 1.1rem;
    height: 1.1rem;
    border: 1.5px solid #c7d2fe;
    border-radius: 5px;
    accent-color: #6366f1;
    cursor: pointer;
    flex-shrink: 0;
  }

  /* ── Radio ── */
  .rjsf-beautiful .radio-inline {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-right: 1rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
    text-transform: none;
    letter-spacing: 0;
  }
  .rjsf-beautiful input[type="radio"] { accent-color: #6366f1; width: 1rem; height: 1rem; }

  /* ── Helper text & errors ── */
  .rjsf-beautiful .field-description {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.3rem;
    font-style: normal;
    line-height: 1.4;
  }
  .rjsf-beautiful .error-detail { list-style: none; padding: 0; margin: 0.35rem 0 0 0; }
  .rjsf-beautiful .error-detail li,
  .rjsf-beautiful .text-danger {
    font-size: 0.75rem;
    color: #ef4444;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .rjsf-beautiful .error-detail li::before { content: '●'; font-size: 0.45rem; }
  .rjsf-beautiful .has-error input,
  .rjsf-beautiful .has-error select,
  .rjsf-beautiful .has-error textarea {
    border-color: #fca5a5;
    background: #fff8f8;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
  }

  /* ── Submit button ── */
  .rjsf-beautiful button[type="submit"] {
    width: 100%;
    padding: 0.85rem 2rem;
    margin-top: 0.5rem;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
    box-shadow: 0 4px 14px rgba(79,70,229,0.4);
    position: relative;
    overflow: hidden;
  }
  .rjsf-beautiful button[type="submit"]::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .rjsf-beautiful button[type="submit"]:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(79,70,229,0.5);
    filter: brightness(1.06);
  }
  .rjsf-beautiful button[type="submit"]:active { transform: translateY(0); }

  /* ── Fieldset / legend ── */
  .rjsf-beautiful fieldset { border: none; padding: 0; margin: 0; }
  .rjsf-beautiful legend {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6366f1;
    margin-bottom: 0.875rem;
    padding: 0;
  }

  /* ── Array items ── */
  .rjsf-beautiful .array-item {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 10px;
    margin-bottom: 0.6rem;
    border: 1px solid #e2e8f0;
  }
  .rjsf-beautiful .array-item-add button,
  .rjsf-beautiful .array-item-remove {
    background: #eef2ff;
    color: #4338ca;
    border: none;
    border-radius: 8px;
    padding: 0.35rem 0.8rem;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .rjsf-beautiful .array-item-add button:hover { background: #e0e7ff; }

  /* ── Range ── */
  .rjsf-beautiful input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    border-radius: 3px;
    background: #e2e8f0;
    outline: none;
    border: none;
    padding: 0;
  }
  .rjsf-beautiful input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(99,102,241,0.4);
  }

  /* ── Number spin hide ── */
  .rjsf-beautiful input[type="number"]::-webkit-inner-spin-button,
  .rjsf-beautiful input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

  /* ── Fade-in ── */
  @keyframes formFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .rjsf-beautiful { animation: formFadeIn 0.35s ease-out; }

  /* ── Action button keyframes ── */
  @keyframes iconPop { 0% { transform: scale(0.6); opacity: 0; } 65% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes labelSlideUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes badgeFadeIn { from { opacity: 0; transform: translateY(3px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes shimmerSweep { from { transform: translateX(-100%); } to { transform: translateX(250%); } }

  .icon-pop    { animation: iconPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .label-slide { animation: labelSlideUp 0.25s ease-out 0.05s both; }
  .badge-in    { animation: badgeFadeIn 0.3s ease-out 0.15s both; }
`;

if (typeof document !== 'undefined' && !document.getElementById('rjsf-beautiful-styles')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'rjsf-beautiful-styles';
  styleTag.textContent = FORM_STYLES;
  document.head.appendChild(styleTag);
}
/* ─────────────────────────────────────────────────────────────
   REUSABLE ACTION BUTTON
   ───────────────────────────────────────────────────────────── */
const THEMES = {
  emerald: {
    successBg:     'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    successBorder: '#6ee7b7',
    successShadow: 'rgba(16,185,129,0.18)',
    iconBg:        '#10b981',
    textColor:     '#065f46',
    badgeBg:       '#d1fae5',
    badgeText:     '#065f46',
  },
  indigo: {
    successBg:     'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    successBorder: '#a5b4fc',
    successShadow: 'rgba(99,102,241,0.18)',
    iconBg:        '#6366f1',
    textColor:     '#3730a3',
    badgeBg:       '#e0e7ff',
    badgeText:     '#3730a3',
  },
  violet: {
    successBg:     'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    successBorder: '#c4b5fd',
    successShadow: 'rgba(124,58,237,0.18)',
    iconBg:        '#7c3aed',
    textColor:     '#5b21b6',
    badgeBg:       '#ede9fe',
    badgeText:     '#5b21b6',
  },
};

interface ActionButtonProps {
  onClick: () => void;
  idleIcon: React.ReactNode;
  idleLabel: string;
  idleIconBg: string;
  idleIconColor: string;
  successLabel: string;
  successBadge: string;
  theme: keyof typeof THEMES;
  'data-testid'?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick, idleIcon, idleLabel, idleIconBg, idleIconColor,
  successLabel, successBadge, theme, 'data-testid': testId,
}) => {
  const [done, setDone] = useState(false);
  const t = THEMES[theme];

  const handleClick = () => {
    onClick();
    setDone(true);
    setTimeout(() => setDone(false), 2400);
  };

  return (
    <button
      data-testid={testId}
      onClick={handleClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        width: '100%',
        background: done ? t.successBg : '#ffffff',
        border: `2px solid ${done ? t.successBorder : '#e2e8f0'}`,
        borderRadius: '28px',
        cursor: 'pointer',
        transition: 'background 0.35s, border-color 0.35s, box-shadow 0.35s, transform 0.2s',
        boxShadow: done
          ? `0 6px 28px ${t.successShadow}`
          : '0 1px 4px rgba(0,0,0,0.05)',
        transform: done ? 'translateY(-2px)' : 'translateY(0)',
        overflow: 'hidden',
        outline: 'none',
      }}
    >
      {/* Shimmer sweep on success */}
      {done && (
        <span style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.6) 50%, transparent 75%)',
          animation: 'shimmerSweep 0.65s ease-out forwards',
        }} />
      )}

      {/* Icon bubble */}
      <div
        key={done ? 'done' : 'idle'}
        className={done ? 'icon-pop' : ''}
        style={{
          flexShrink: 0,
          width: '2.5rem', height: '2.5rem',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: done ? t.iconBg : idleIconBg,
          color: done ? '#fff' : idleIconColor,
          transition: 'background 0.3s, color 0.3s',
          boxShadow: done ? `0 3px 12px ${t.successShadow}` : 'none',
        }}
      >
        {done ? <CheckCircle2 size={19} strokeWidth={2.5} /> : idleIcon}
      </div>

      {/* Text stack */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px', overflow: 'hidden' }}>
        <span
          key={`lbl-${done}`}
          className={done ? 'label-slide' : ''}
          style={{
            fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap',
            color: done ? t.textColor : '#334155',
            transition: 'color 0.3s',
          }}
        >
          {done ? successLabel : idleLabel}
        </span>

        {/* Status badge — animates in on success */}
        {done && (
          <span
            className="badge-in"
            style={{
              fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.09em',
              textTransform: 'uppercase', color: t.badgeText,
              background: t.badgeBg, borderRadius: '999px',
              padding: '2px 8px', lineHeight: 1.4,
            }}
          >
            {successBadge}
          </span>
        )}
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────
   CUSTOM FIELD TEMPLATE — adds data-testid per field
   ───────────────────────────────────────────────────────────── */
const CustomFieldTemplate = (props: any) => {
  const { id, classNames, label, help, required, description, errors, children, schema, uiSchema, displayLabel } = props;

  // Extract field name from id (rjsf uses "root_fieldName")
  const fieldName = id?.replace(/^root_/, '') || id;

  // Determine if we should show the label (RJSF sets displayLabel=false for checkboxes/radios)
  const showLabel = displayLabel !== false && label && label.trim() !== '';

  return (
    <div
      data-testid={`field-${fieldName}`}
      style={{
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* ── Label renders FIRST, above the input ── */}
      {showLabel && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: '#475569',
            marginBottom: '0.45rem',
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1,
          }}
        >
          {label}
          {required && (
            <span style={{ color: '#6366f1', marginLeft: '3px' }}>*</span>
          )}
        </label>
      )}

      {/* ── Input widget ── */}
      <div style={{ width: '100%' }}>{children}</div>

      {/* ── Description ── */}
      {description && (
        <p style={{
          fontSize: '0.72rem',
          color: '#94a3b8',
          marginTop: '0.3rem',
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.4,
        }}>
          {description}
        </p>
      )}

      {/* ── Validation errors ── */}
      {errors}
      {help}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN APP
   ───────────────────────────────────────────────────────────── */
const App = () => {
  const {
    currentSchema,
    messages,
    addMessage,
    updateSchema,
    schemaDiff,
    formData = {},
    setFormData,
  } = useFormStore();

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* ── Conditional field visibility via x-show-when ── */
  const filteredSchema = useMemo(() => {
    if (!currentSchema?.properties) return currentSchema;
    const properties = { ...currentSchema.properties };
    const required = currentSchema.required ? [...currentSchema.required] : [];
    Object.keys(properties).forEach((key) => {
      const field = properties[key];
      if (field['x-show-when']) {
        const { field: targetField, equals } = field['x-show-when'];
        if (formData[targetField] !== equals) {
          delete properties[key];
          const reqIndex = required.indexOf(key);
          if (reqIndex > -1) required.splice(reqIndex, 1);
        }
      }
    });
    return { ...currentSchema, properties, required };
  }, [currentSchema, formData]);

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;
    const userPrompt = userInput;
    addMessage('user', userPrompt);
    setUserInput('');
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/form/generate', {
        prompt: userPrompt,
        history: messages,
        currentSchema: currentSchema,
        version: currentSchema.version || 1,
      });
      if (response.data.status === 'clarification_needed') {
        addMessage('ai', `🤔 ${response.data.questions?.join(' ')}`);
      } else if (response.data.schema) {
        updateSchema(response.data.schema);
        addMessage('ai', '✨ Form updated successfully.');
      }
    } catch (error: any) {
      addMessage('ai', '❌ Backend error. Please verify server status.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(currentSchema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-v${currentSchema.version || 1}.json`;
    link.click();
  };

  const generateCurl = () => {
    const curl = `curl -X POST http://localhost:8080/api/form/generate \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify({ prompt: 'Refine form', currentSchema }, null, 2)}'`;
    copyToClipboard(curl);
  };

  const copyCodeSnippet = () => {
    const snippet = `import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

const schema = ${JSON.stringify(currentSchema, null, 2)};

export default function MyForm() {
  return <Form schema={schema} validator={validator} />;
}`;
    copyToClipboard(snippet);
  };

  const fieldCount = filteredSchema?.properties
    ? Object.keys(filteredSchema.properties).length
    : 0;

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] overflow-hidden text-slate-900">

      {/* ── LEFT PANE — Chat ── */}
      <div
        data-testid="chat-pane"
        className="w-[400px] flex flex-col bg-white border-r border-slate-200 shadow-xl z-20"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <MessageSquare size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Form Architect</h1>
              <p className="text-xs text-indigo-100 opacity-80 uppercase tracking-widest font-semibold">
                AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-4 rounded-2xl max-w-[90%] shadow-sm text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {/* Schema Diff Panel */}
          {schemaDiff && schemaDiff.length > 0 && (
            <div
              data-testid="schema-diff-panel"
              className="mt-4 p-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800"
            >
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                <Code size={14} />
                <span>Architectural Changes</span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                {schemaDiff.map((change: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    {change.kind === 'N' && (
                      <span className="text-emerald-400 font-bold tracking-tight">
                        + {change.path?.join('.')}
                      </span>
                    )}
                    {change.kind === 'D' && (
                      <span className="text-red-400 font-bold tracking-tight">
                        - {change.path?.join('.')}
                      </span>
                    )}
                    {change.kind === 'E' && (
                      <span className="text-amber-400 font-bold tracking-tight">
                        Δ {change.path?.join('.')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-5 border-t border-slate-100 bg-white">
          <div className="relative">
            <input
              className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
              placeholder="Refine your form architecture..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANE — Form Renderer ── */}
      <div
        data-testid="form-renderer-pane"
        className="flex-1 overflow-y-auto p-12 bg-[#F8FAFC]"
      >
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Live Preview Card */}
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <Layout size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Live Preview</h2>
                  <p className="text-xs text-slate-400 font-medium tracking-wide">
                    Build v{currentSchema.version || 1}
                    {fieldCount > 0 && (
                      <span className="ml-2 text-indigo-400">
                        · {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  Active Sync
                </span>
              </div>
            </div>

            <div className="p-12 min-h-[500px] flex flex-col items-center">
              {filteredSchema?.properties && Object.keys(filteredSchema.properties).length > 0 ? (
                <div className="w-full max-w-lg">
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '2.25rem 2.5rem 2rem',
                      border: '1px solid #e8ecf4',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(99,102,241,0.06)',
                    }}
                  >
                    {currentSchema.title && (
                      <div style={{ marginBottom: '1.75rem' }}>
                        <h3
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            letterSpacing: '-0.015em',
                            marginBottom: '0.3rem',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {currentSchema.title}
                        </h3>
                        {currentSchema.description && (
                          <p
                            style={{
                              fontSize: '0.825rem',
                              color: '#94a3b8',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 400,
                              lineHeight: 1.5,
                            }}
                          >
                            {currentSchema.description}
                          </p>
                        )}
                        <div
                          style={{
                            height: '1px',
                            background: '#f1f5f9',
                            marginTop: '1.25rem',
                          }}
                        />
                      </div>
                    )}
                    <div className="rjsf-beautiful">
                      <Form
                        schema={filteredSchema as any}
                        formData={formData}
                        validator={validator}
                        templates={{ FieldTemplate: CustomFieldTemplate }}
                        onChange={(e) =>
                          typeof setFormData === 'function' && setFormData(e.formData)
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 opacity-20">
                  <Zap size={64} className="mb-4 text-slate-300" />
                  <p className="text-lg font-bold text-slate-400 tracking-tight">
                    Architecture is currently empty.
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    Describe a form in the chat to get started.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Export / Action Buttons ── */}
          <div data-testid="export-panel" className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ActionButton
              data-testid="export-json-button"
              onClick={downloadJSON}
              idleIcon={<Download size={19} />}
              idleLabel="Download JSON"
              idleIconBg="#eef2ff"
              idleIconColor="#6366f1"
              successLabel="File Downloaded"
              successBadge="✓ Saved to device"
              theme="emerald"
            />
            <ActionButton
              data-testid="copy-code-button"
              onClick={copyCodeSnippet}
              idleIcon={<Copy size={19} />}
              idleLabel="Copy Schema"
              idleIconBg="#f1f5f9"
              idleIconColor="#64748b"
              successLabel="Schema Copied"
              successBadge="✓ In clipboard"
              theme="indigo"
            />
            <ActionButton
              data-testid="copy-curl-button"
              onClick={generateCurl}
              idleIcon={<Terminal size={19} />}
              idleLabel="cURL Request"
              idleIconBg="#f1f5f9"
              idleIconColor="#64748b"
              successLabel="cURL Copied"
              successBadge="✓ Ready to paste"
              theme="violet"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;