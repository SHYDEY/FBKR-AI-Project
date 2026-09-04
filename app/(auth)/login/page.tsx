import Panel from '@/components/ui/panel';
import LoginForm from './login-form';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const params = await searchParams; return <Panel><h1>로그인</h1><p className="muted">Super SCM에 로그인하세요.</p><LoginForm next={params.next ?? '/'} /></Panel>; }
