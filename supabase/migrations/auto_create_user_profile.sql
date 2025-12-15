-- 自动创建用户资料和进度的触发器
-- 当 auth.users 中创建新用户时，自动在 user_profiles 和 user_progress 中创建对应记录

-- 函数：从 user_metadata 生成邀请码（仅学生）
create or replace function generate_invite_code()
returns text as $$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  code text := '';
  i integer;
begin
  for i in 1..8 loop
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return code;
end;
$$ language plpgsql;

-- 函数：自动创建用户资料和进度
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_account_name text;
  v_nickname text;
  v_role text;
  v_invite_code text;
begin
  -- 从 user_metadata 中提取信息
  v_account_name := (new.raw_user_meta_data->>'account_name');
  v_nickname := (new.raw_user_meta_data->>'nickname');
  v_role := coalesce((new.raw_user_meta_data->>'role'), 'student');
  
  -- 如果是学生，生成邀请码
  if v_role = 'student' then
    v_invite_code := generate_invite_code();
    -- 确保邀请码唯一（如果冲突则重新生成）
    while exists (select 1 from public.user_profiles where invite_code = v_invite_code) loop
      v_invite_code := generate_invite_code();
    end loop;
  end if;
  
  -- 插入 user_profiles
  insert into public.user_profiles (
    id,
    account_name,
    nickname,
    email,
    role,
    invite_code
  ) values (
    new.id,
    v_account_name,
    v_nickname,
    new.email,
    v_role,
    v_invite_code
  );
  
  -- 插入 user_progress
  insert into public.user_progress (
    user_id
  ) values (
    new.id
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- 创建触发器
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
