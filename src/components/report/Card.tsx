import { ReactNode } from "react";

interface CardProps {
  eyebrow: string;
  eyebrowRight?: string;
  children: ReactNode;
  bodyPadding?: string;
}

export default function Card({ eyebrow, eyebrowRight, children, bodyPadding = '20px' }: CardProps) {
  return (
    <div
      className="border"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--line)',
        borderRadius: '0',
      }}
    >
      <div
        className="flex items-baseline justify-between"
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--line-subtle)',
        }}
      >
        <span className="eyebrow">{eyebrow}</span>
        {eyebrowRight && (
          <span
            className="text-[10px] uppercase tracking-wider"
            style={{ color: 'var(--ink-tertiary)', letterSpacing: '0.04em' }}
          >
            {eyebrowRight}
          </span>
        )}
      </div>
      <div style={{ padding: bodyPadding }}>{children}</div>
    </div>
  );
}
