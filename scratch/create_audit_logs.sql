-- アクセスログ（証跡）を保存するテーブルを作成します
create table audit_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references app_users(id) not null,
    company_id uuid references companies(id),
    action_type text not null, -- 例: 'SEARCH', 'VIEW_CASE'
    target_id text, -- 例: 検索キーワード や 閲覧したケースのID
    ip_address text, -- 接続元のIPアドレス（取得できる場合）
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 管理者とシステムだけが操作できるように設定（RLS）
alter table audit_logs enable row level security;

-- システム（Service Role）と、管理者（admin）のみフルアクセス可能にするポリシー
create policy "Admins can view audit logs"
on audit_logs
for select
using (
  (select role from app_users where id = auth.uid()) = 'admin'
);

-- （※INSERTはアプリケーション側のAPIから service_role_key を用いて実行するためポリシー不要）
