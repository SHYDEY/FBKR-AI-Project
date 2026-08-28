import type { ReactNode } from 'react';
import type { BadgeTone } from './badge';

export default function KpiCard({ label, value, unit, description, tone = 'neutral' }: { label: string; value: ReactNode; unit?: string; description?: string; tone?: BadgeTone }) {
  return <section className={`kpi-card kpi-${tone}`}><div className="metric-label">{label}</div><div className="metric-value">{value}{unit ? <span className="metric-unit">{unit}</span> : null}</div>{description ? <div className="metric-foot">{description}</div> : null}</section>;
}
