import { signOutAction } from '@/app/(auth)/logout/actions';

export default function LogoutButton() {
  return <form className="logout-form" action={signOutAction}><button className="ui-button ghost" type="submit">로그아웃</button></form>;
}
