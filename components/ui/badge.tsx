import type { ReactNode } from 'react';

export type BadgeTone = 'safe' | 'warning' | 'critical' | 'unavailable' | 'info' | 'neutral';

export default function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`ui-badge ${tone}`}>{children}</span>;
}
