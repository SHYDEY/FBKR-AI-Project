import PageHeader from '@/components/shell/page-header';
import Panel from '@/components/ui/panel';
import LoginForm from '@/components/auth/login-form';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith('/') && !params.next.startsWith('//') ? params.next : '/';
  return <main className="auth-page"><PageHeader eyebrow="AUTHENTICATION" title="로그인" description="SCM 분석 공간에 접속하기 위한 인증 화면입니다." /><Panel title="SCM 분석 공간에 로그인"><LoginForm next={next} /></Panel></main>;
}
