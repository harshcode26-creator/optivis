import { Eye, EyeOff } from 'lucide-react';

function InputField({
  autoComplete,
  className = '',
  disabled = false,
  helperText,
  highlight = false,
  id,
  inputClassName = '',
  label,
  name,
  onChange,
  onToggleVisibility,
  placeholder,
  readOnly = false,
  required = false,
  showToggle = false,
  showValue = false,
  type = 'text',
  value,
}) {
  const inputId = id || name;
  const inputType = showToggle ? (showValue ? 'text' : 'password') : type;

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <label
        htmlFor={inputId}
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          className={`h-11 w-full rounded-md border px-3 text-sm outline-nonetransition-all duration-200 focus:scale-[1.01] placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-75 dark:placeholder:text-slate-500 hover:border-indigo-400${
            highlight
              ? 'border-indigo-200 bg-indigo-50/80 text-slate-900 dark:border-indigo-400/20 dark:bg-white/[0.06] dark:text-white'
              : 'border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-[#0c1222] dark:text-white'
          } ${showToggle ? 'pr-11' : ''} ${inputClassName}`.trim()}
        />

        {showToggle ? (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-300"
            aria-label={showValue ? 'Hide password' : 'Show password'}
          >
            {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      {helperText ? (
        <p className="text-xs italic text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

export default InputField;
