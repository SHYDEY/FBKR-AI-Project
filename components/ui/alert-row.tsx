import type { ReactNode } from 'react';
import Badge, { type Status } from './badge';
export default function AlertRow({ status, children }: { status: Status; children: ReactNode }) { return <div className="alert-row"><Badge status={status} /> <span>{children}</span></div>; }
