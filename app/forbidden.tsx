import Link from 'next/link';

export default function Forbidden() {
  return <main className="auth-page"><div className="eyebrow">403 FORBIDDEN</div><h1>접근 권한이 없습니다.</h1><p className="muted">관리자 권한이 필요한 화면입니다.</p><Link className="button primary" href="/">전체 현황으로 이동</Link></main>;
}
