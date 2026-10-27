import { Check, X } from 'lucide-react';

export function checkPasswordRules(password = '') {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordSecure(password = '') {
  const rules = checkPasswordRules(password);
  return (
    rules.minLength &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumber &&
    rules.hasSpecial
  );
}

export function getPasswordStrength(password = '') {
  if (!password) return { score: 0, label: 'Vacía', color: 'bg-zinc-400' };
  const rules = checkPasswordRules(password);
  const passed = Object.values(rules).filter(Boolean).length;

  if (passed <= 2) return { score: 1, label: 'Débil', color: 'bg-[var(--brand-crimson)]' };
  if (passed <= 3) return { score: 2, label: 'Regular', color: 'bg-amber-500' };
  if (passed === 4) return { score: 3, label: 'Buena', color: 'bg-blue-500' };
  return { score: 4, label: 'Excelente', color: 'bg-[var(--brand-emerald)]' };
}

export default function PasswordStrengthIndicator({ password = '' }) {
  const rules = checkPasswordRules(password);
  const strength = getPasswordStrength(password);

  const criteria = [
    { label: 'Mínimo 8 caracteres', ok: rules.minLength },
    { label: 'Una letra mayúscula', ok: rules.hasUpper },
    { label: 'Una letra minúscula', ok: rules.hasLower },
    { label: 'Al menos un número', ok: rules.hasNumber },
    { label: 'Un símbolo (!@#$...)', ok: rules.hasSpecial },
  ];

  return (
    <div className="flex flex-col gap-2 mt-1.5 p-2.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)]">
      {/* Barra de progreso */}
      <div className="flex items-center justify-between text-[11px] font-display font-bold">
        <span className="text-[var(--text-muted)]">Seguridad de la clave:</span>
        <span className={strength.score >= 4 ? 'text-[var(--brand-emerald)]' : strength.score >= 3 ? 'text-blue-500' : strength.score >= 2 ? 'text-amber-500' : 'text-[var(--brand-crimson)]'}>
          {strength.label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={[
              'h-full rounded-full transition-all duration-300',
              step <= strength.score ? strength.color : 'bg-[var(--border-muted)]',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Checklist de requisitos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px]">
        {criteria.map((item, i) => (
          <div
            key={i}
            className={[
              'flex items-center gap-1.5 transition-colors',
              item.ok ? 'text-[var(--brand-emerald)] font-semibold' : 'text-[var(--text-muted)]',
            ].join(' ')}
          >
            {item.ok ? <Check size={12} className="shrink-0 stroke-[2.5]" /> : <X size={12} className="shrink-0 text-[var(--border)]" />}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
