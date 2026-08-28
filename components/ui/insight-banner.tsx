import type { ReactNode } from 'react';

export default function InsightBanner({ tone = 'info', title, children }: { tone?: 'info' | 'safe' | 'warning' | 'critical'; title?: string; children: ReactNode }) {
  return <div className={`insight-banner ${tone}`} role={tone === 'critical' ? 'alert' : undefined}><div>{title ? <strong>{title}</strong> : null}{children}</div></div>;
}
