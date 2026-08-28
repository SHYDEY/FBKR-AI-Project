import type { ReactNode } from 'react';
import Badge, { type BadgeTone } from './badge';

export default function AlertRow({ tone, title, description, action }: { tone: BadgeTone; title: string; description?: string; action?: ReactNode }) {
  return <div className="alert-row"><div><strong>{title}</strong>{description ? <div className="muted">{description}</div> : null}</div><div className="alert-row-end"><Badge tone={tone}>{tone === 'safe' ? 'SAFE' : tone === 'warning' ? 'WARNING' : tone === 'critical' ? 'CRITICAL' : '확인'}</Badge>{action}</div></div>;
}
