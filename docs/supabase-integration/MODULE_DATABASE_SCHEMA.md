# 模块化数据库表结构设计

## 📊 模块与表的对应关系

| 模块 | 数据库表 | 说明 |
|------|----------|------|
| **基础设施** | `auth.users` | Supabase 内置表 |
| **用户模块** | `user_profiles`<br>`user_progress` | 用户资料和进度 |
| **练习模块** | `exercise_records`<br>`letter_stats` | 练习记录和字母统计 |
| **游戏模块** | `game_records` | 游戏记录 |
| **积分模块** | `points_transactions` | 积分交易记录 |
| **礼物模块** | `gifts`<br>`redeemed_gifts` | 礼物和兑换记录 |
| **成就模块** | `achievements` | 成就记录 |
| **家长模块** | `parent_student_relations` | 家长-学生关联 |
| **资源模块** | `pronunciation_resources`<br>`word_resources`<br>`sentence_resources`<br>`textbook_resources` | 各类资源 |

---

## 📋 完整表结构（按模块）

### 基础设施模块

使用 Supabase Auth 内置表，无需创建。

---

### 用户模块

#### user_profiles（用户资料表）

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('parent', 'student')),
  sound_enabled BOOLEAN DEFAULT true,
  pronunciation_enabled BOOLEAN DEFAULT true,
  pronunciation_volume INTEGER DEFAULT 80 CHECK (pronunciation_volume >= 0 AND pronunciation_volume <= 100),
  letter_pronunciation_enabled BOOLEAN DEFAULT true,
  word_pronunciation_enabled BOOLEAN DEFAULT true,
  sentence_pronunciation_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### user_progress（用户进度表）

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 1,
  consecutive_days INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  total_points INTEGER NOT NULL DEFAULT 0,
  used_points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

### 练习模块

#### exercise_records（练习记录表）

```sql
CREATE TABLE exercise_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  date DATE NOT NULL,
  total_chars INTEGER NOT NULL DEFAULT 0,
  correct_chars INTEGER NOT NULL DEFAULT 0,
  total_time_ms INTEGER NOT NULL DEFAULT 0,
  earned_points INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,4) NOT NULL DEFAULT 0,
  avg_response_time_ms DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_exercise_records_user_date ON exercise_records(user_id, date DESC);
```

#### letter_stats（字母统计表）

```sql
CREATE TABLE letter_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  letter TEXT NOT NULL,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  total_response_time_ms BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, letter)
);

CREATE INDEX idx_letter_stats_user ON letter_stats(user_id);
```

---

### 游戏模块

#### game_records（游戏记录表）

```sql
CREATE TABLE game_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  date DATE NOT NULL,
  total_time_ms INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_type, date)
);
```

---

### 积分模块

#### points_transactions（积分交易记录表）

```sql
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  reason TEXT NOT NULL,
  related_id UUID,  -- 关联到相关记录（如 gift_id, achievement_id）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX idx_points_transactions_date ON points_transactions(created_at DESC);
```

**字段说明**：
- `amount`: 积分数量（正数为增加，负数为扣除）
- `type`: 交易类型（'earn' 获得，'spend' 消费）
- `reason`: 交易原因（如 'daily_exercise', 'gift_redemption'）
- `related_id`: 关联记录 ID（可选）

---

### 礼物模块

#### gifts（礼物表）

```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### redeemed_gifts（已兑换礼物表）

```sql
CREATE TABLE redeemed_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

CREATE INDEX idx_redeemed_gifts_user ON redeemed_gifts(user_id);
```

---

### 成就模块

#### achievements（成就记录表）

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
```

---

### 家长模块

#### parent_student_relations（家长-学生关联表）

```sql
CREATE TABLE parent_student_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id),
  CHECK (parent_id != student_id)
);

CREATE INDEX idx_parent_student_parent ON parent_student_relations(parent_id);
CREATE INDEX idx_parent_student_student ON parent_student_relations(student_id);
```

---

### 资源模块

#### pronunciation_resources（发音资源表）

```sql
CREATE TABLE pronunciation_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('letter', 'word', 'sentence')),
  content TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  language TEXT DEFAULT 'en-US',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type, content, language)
);

CREATE INDEX idx_pronunciation_resources_type ON pronunciation_resources(content_type);
CREATE INDEX idx_pronunciation_resources_content ON pronunciation_resources(content);
```

#### word_resources（单词资源表）

```sql
CREATE TABLE word_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  definition TEXT,
  example_sentence TEXT,
  image_url TEXT,
  difficulty_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_word_resources_word ON word_resources(word);
```

#### sentence_resources（句子资源表）

```sql
CREATE TABLE sentence_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sentence TEXT NOT NULL UNIQUE,
  difficulty_level INTEGER DEFAULT 1,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentence_resources_category ON sentence_resources(category);
```

#### textbook_resources（课本资源表，未来扩展）

```sql
CREATE TABLE textbook_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level INTEGER,
  description TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE textbook_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  textbook_id UUID NOT NULL REFERENCES textbook_resources(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(textbook_id, chapter_number)
);
```

#### pronunciation_records（发音使用记录表，可选）

```sql
CREATE TABLE pronunciation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pronunciation_type TEXT NOT NULL CHECK (pronunciation_type IN ('letter', 'word', 'sentence')),
  content TEXT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pronunciation_records_user ON pronunciation_records(user_id);
CREATE INDEX idx_pronunciation_records_type ON pronunciation_records(pronunciation_type);
CREATE INDEX idx_pronunciation_records_date ON pronunciation_records(played_at DESC);
```

---

## 🔒 RLS 策略（按模块）

### 用户模块 RLS

```sql
-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON user_profiles FOR ALL USING (auth.uid() = id);

-- user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
```

### 练习模块 RLS

```sql
-- exercise_records
ALTER TABLE exercise_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own exercise records" ON exercise_records FOR ALL USING (auth.uid() = user_id);

-- letter_stats
ALTER TABLE letter_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own letter stats" ON letter_stats FOR ALL USING (auth.uid() = user_id);
```

### 游戏模块 RLS

```sql
-- game_records
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own game records" ON game_records FOR ALL USING (auth.uid() = user_id);
```

### 积分模块 RLS

```sql
-- points_transactions
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points transactions" ON points_transactions FOR SELECT USING (auth.uid() = user_id);
-- 插入由系统通过函数完成，不直接允许用户插入
```

### 礼物模块 RLS

```sql
-- gifts（系统表）
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active gifts" ON gifts FOR SELECT TO authenticated USING (is_active = true);

-- redeemed_gifts
ALTER TABLE redeemed_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own redeemed gifts" ON redeemed_gifts FOR ALL USING (auth.uid() = user_id);
```

### 成就模块 RLS

```sql
-- achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
```

### 家长模块 RLS

```sql
-- parent_student_relations
ALTER TABLE parent_student_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents and students can view relations" ON parent_student_relations FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = student_id);
CREATE POLICY "Parents can create relations" ON parent_student_relations FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can delete relations" ON parent_student_relations FOR DELETE USING (auth.uid() = parent_id);
```

### 资源模块 RLS

```sql
-- pronunciation_resources（系统资源）
ALTER TABLE pronunciation_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view pronunciation resources" ON pronunciation_resources FOR SELECT TO authenticated USING (true);

-- word_resources（系统资源）
ALTER TABLE word_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view word resources" ON word_resources FOR SELECT TO authenticated USING (true);

-- sentence_resources（系统资源）
ALTER TABLE sentence_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view sentence resources" ON sentence_resources FOR SELECT TO authenticated USING (true);

-- textbook_resources（系统资源）
ALTER TABLE textbook_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active textbooks" ON textbook_resources FOR SELECT TO authenticated USING (is_active = true);

-- pronunciation_records（用户数据）
ALTER TABLE pronunciation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pronunciation records" ON pronunciation_records FOR ALL USING (auth.uid() = user_id);
```

---

## 📝 触发器（按模块）

### 用户模块触发器

```sql
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 游戏模块触发器

```sql
CREATE TRIGGER update_game_records_updated_at
  BEFORE UPDATE ON game_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 资源模块触发器

```sql
CREATE TRIGGER update_pronunciation_resources_updated_at
  BEFORE UPDATE ON pronunciation_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```
