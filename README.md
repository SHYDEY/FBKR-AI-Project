# 런치픽

직장인을 위한 오늘의 점심 메뉴와 후식 음료 추천 웹사이트입니다. 점심 20가지와 음료 10가지를 각각 필터링하고, 모든 항목을 저장하거나 인기순으로 추천받을 수 있습니다.

## Supabase 저장 수 연결

1. Supabase 프로젝트를 만든 뒤 SQL Editor에서 [`supabase/schema.sql`](supabase/schema.sql)을 실행합니다. 기존 프로젝트도 새 음식·음료 ID를 허용하려면 업데이트된 SQL을 다시 실행해야 합니다.
2. `supabase-config.js`에 프로젝트 URL과 **Publishable key**(또는 레거시 anon key)를 입력합니다.
3. `index.html`을 로컬 서버나 정적 호스팅에서 실행합니다.

```js
window.LUNCH_PICK_SUPABASE = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_PUBLISHABLE_OR_ANON_KEY'
};
```

`service_role` 키는 브라우저 코드에 넣으면 안 됩니다. 설정 전에는 화면은 정상 동작하지만 하트 저장 요청은 실행되지 않습니다.
