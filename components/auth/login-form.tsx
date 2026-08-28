'use client';

import { useActionState } from 'react';
import { signInAction } from '@/app/(auth)/login/actions';

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signInAction, { error: null });
  return <form className="auth-form" action={formAction}><input type="hidden" name="next" value={next} /><label>이메일<input name="email" type="email" autoComplete="email" required /></label><label>비밀번호<input name="password" type="password" autoComplete="current-password" required /></label>{state.error ? <p className="form-error" role="alert">{state.error}</p> : null}<button className="ui-button primary" type="submit" disabled={pending}>{pending ? '로그인 중…' : '로그인'}</button></form>;
}
