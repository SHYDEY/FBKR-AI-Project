import PageHeader from '@/components/shell/page-header';
import Panel from '@/components/ui/panel';

export default function LoginPage() {
  return <main className="auth-page"><PageHeader eyebrow="AUTHENTICATION" title="로그인" description="SCM 분석 공간에 접속하기 위한 인증 화면입니다." /><Panel title="인증 연결 준비 중"><p className="muted">실제 인증과 권한 처리는 후속 단계에서 연결합니다.</p></Panel></main>;
}
