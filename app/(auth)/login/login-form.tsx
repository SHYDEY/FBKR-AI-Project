'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';

export default function LoginForm({ next }: { next: string }) { const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null }); return <form action={action} className="login-form"><label>이메일<input name="email" type="email" autoComplete="email" required /></label><label>비밀번호<input name="password" type="password" autoComplete="current-password" required /></label><input type="hidden" name="next" value={next} />{state.error && <p className="text-danger" role="alert">{state.error}</p>}<button className="button button-primary" disabled={pending}>{pending ? '로그인 중…' : '로그인'}</button></form>; }
