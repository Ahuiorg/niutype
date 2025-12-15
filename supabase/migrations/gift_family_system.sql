-- Gift Family System Migration
-- 确保一个学生只能被一个家长关联，并支持家长为学生创建礼物

-- 1. 添加学生唯一约束（一个学生只能被一个家长关联）
-- 首先检查并删除现有约束（如果存在）
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'parent_student_relations_unique_student') THEN
    ALTER TABLE public.parent_student_relations DROP CONSTRAINT parent_student_relations_unique_student;
  END IF;
END $$;

-- 添加学生唯一约束
ALTER TABLE public.parent_student_relations 
  ADD CONSTRAINT parent_student_relations_unique_student UNIQUE (student_id);

-- 2. 修改 gifts 表结构，添加家长和学生关联
ALTER TABLE public.gifts 
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_gifts_created_by ON public.gifts(created_by);
CREATE INDEX IF NOT EXISTS idx_gifts_student_id ON public.gifts(student_id);

-- 3. 更新 RLS 策略
-- 删除旧策略
DROP POLICY IF EXISTS "Public gifts readable" ON public.gifts;
DROP POLICY IF EXISTS "Users manage gifts" ON public.gifts;

-- 家长可以管理自己为学生创建的礼物
CREATE POLICY "Parents manage gifts for their students"
  ON public.gifts FOR ALL
  USING (
    auth.uid() = created_by OR 
    auth.uid() = student_id OR
    created_by IS NULL  -- 兼容旧数据
  )
  WITH CHECK (auth.uid() = created_by);

-- 4. 更新 redeemed_gifts 的 RLS
DROP POLICY IF EXISTS "Users manage own redeemed gifts" ON public.redeemed_gifts;

-- 学生可以管理自己的兑换记录，家长可以查看关联学生的记录
CREATE POLICY "Users manage redeemed gifts"
  ON public.redeemed_gifts FOR ALL
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.parent_student_relations 
      WHERE parent_id = auth.uid() AND student_id = redeemed_gifts.user_id
    )
  )
  WITH CHECK (auth.uid() = user_id);

-- 5. 添加检查学生是否已被绑定的函数
CREATE OR REPLACE FUNCTION check_student_not_already_bound()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.parent_student_relations 
    WHERE student_id = NEW.student_id AND parent_id != NEW.parent_id
  ) THEN
    RAISE EXCEPTION '该学生已被其他家长绑定';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS check_student_binding ON public.parent_student_relations;

-- 创建触发器
CREATE TRIGGER check_student_binding
  BEFORE INSERT ON public.parent_student_relations
  FOR EACH ROW
  EXECUTE FUNCTION check_student_not_already_bound();
