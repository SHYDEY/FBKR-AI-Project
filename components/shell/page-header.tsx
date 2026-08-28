import type { ReactNode } from 'react';

export default function PageHeader({ eyebrow = 'ANALYSIS', title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{action ? <div className="page-header-action">{action}</div> : null}</div>;
}
