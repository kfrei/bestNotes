import React from 'react';

interface WarmStudioToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  disabled?: boolean;
  badge?: React.ReactNode;
  className?: string;
}

/**
 * Reusable Warm Studio Toggle Switch
 * Follows the Navy (#1e3a5f) + Warm Paper (#fdfbf7/#dfd8cb) aesthetic.
 * Replaces native browser checkboxes with a calm, tactile switch.
 */
export const WarmStudioToggle: React.FC<WarmStudioToggleProps> = ({
  checked,
  onChange,
  label,
  icon,
  title,
  disabled = false,
  badge,
  className = '',
}) => {
  return (
    <label
      title={title}
      className={`inline-flex items-center justify-between gap-2 cursor-pointer select-none py-0.5 group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      onClick={(e) => {
        if (disabled) return;
        e.preventDefault();
        onChange(!checked);
      }}
    >
      {(icon || label) && (
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2c3e50] tracking-tight">
          {icon && <span className="text-[#64748b] group-hover:text-[#1e3a5f] transition-colors">{icon}</span>}
          {label && <span>{label}</span>}
          {badge}
        </span>
      )}
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/40 ${
          checked ? 'bg-[#1e3a5f]' : 'bg-[#dfd8cb] group-hover:bg-[#d5cdc0]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transform transition-transform duration-150 ease-out ${
            checked ? 'translate-x-4.5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </label>
  );
};
