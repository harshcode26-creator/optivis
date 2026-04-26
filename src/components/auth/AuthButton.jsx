function AuthButton({
  children,
  className = '',
  disabled = false,
  trailingIcon: TrailingIcon,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const baseClassName =
    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border text-sm font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70';

  const variantClassName = {
   primary:
  'border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-purple-400 active:scale-[0.97]',
    secondary:
      'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-[#0c1222] dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-white',
    ghost:
      'border-transparent bg-transparent text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200',
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClassName} ${variantClassName} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {TrailingIcon ? <TrailingIcon className="h-4 w-4" /> : null}
    </button>
  );
}

export default AuthButton;
