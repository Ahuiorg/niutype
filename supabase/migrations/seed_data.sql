-- 初始化基础数据：游戏类型和礼物

-- game_types: 游戏类型定义
insert into public.game_types (id, name, description, required_membership, required_level, is_active, sort_order)
values
  ('typing_basic', '基础打字游戏', '完成每日练习后可玩的打字小游戏', 'free', 1, true, 10),
  ('memory_cards', '记忆卡片', '记忆字母顺序的卡片配对游戏', 'free', 2, true, 20),
  ('word_race', '单词竞速', '快速输入单词的竞速游戏', 'free', 3, true, 30),
  ('premium_puzzle', '高级拼图', '仅限高级会员的拼图游戏', 'premium', 1, true, 40)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  required_membership = excluded.required_membership,
  required_level = excluded.required_level,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

-- gifts: 礼物池
insert into public.gifts (id, name, points, image_url, description, is_active)
values
  (gen_random_uuid(), '铅笔套装', 300, null, '精美铅笔套装，练习积分兑换', true),
  (gen_random_uuid(), '贴纸包', 150, null, '可爱贴纸包，完成每日练习送', true),
  (gen_random_uuid(), '笔记本', 500, null, '精美笔记本，记录学习点滴', true),
  (gen_random_uuid(), '书签', 100, null, '精美书签，阅读好伙伴', true),
  (gen_random_uuid(), '橡皮擦', 80, null, '卡通橡皮擦，学习小助手', true)
on conflict do nothing;
