import type { ReactNode } from 'react';
export default function Panel({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) { return <section className="panel">{title && <div className="card-title"><h3>{title}</h3>{action}</div>}{children}</section>; }
