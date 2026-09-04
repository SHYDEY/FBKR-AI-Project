export type Status = 'SAFE' | 'WARNING' | 'CRITICAL' | 'CALCULATION_UNAVAILABLE';
export default function Badge({ status, children }: { status: Status; children?: string }) { const tone = status === 'CALCULATION_UNAVAILABLE' ? 'unavailable' : status.toLowerCase(); return <span className={`badge badge-${tone}`}>{children ?? status}</span>; }
