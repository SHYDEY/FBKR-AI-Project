import type { ReactNode } from 'react';

export default function Panel({ title, description, action, children }: { title?: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="panel">{title ? <div className="panel-header"><div><h3>{title}</h3>{description ? <span>{description}</span> : null}</div>{action}</div> : null}{children}</section>;
}
