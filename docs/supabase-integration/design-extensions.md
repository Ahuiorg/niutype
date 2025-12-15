# Supabase 集成 - 扩展功能设计

## 扩展需求

### 1. 用户角色区分（家长/学生）
### 2. 发音功能（字母、单词、句子）

---

## 扩展 1: 用户角色系统

### 需求分析

- **角色类型**: 家长（parent）、学生（student）
- **关联关系**: 一个家长可以管理多个学生
- **权限区分**: 
  - 学生：只能查看和操作自己的数据
  - 家长：可以查看关联学生的数据，但不能修改学生的练习数据

### 数据库设计

#### 新增字段：user_profiles 表

```sql
-- 修改 user_profiles 表，添加角色字段
ALTER TABLE user_profiles 
ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('parent', 'student'));

-- 添加索引
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
```

#### 新增表：parent_student_relations（家长-学生关联表）

```sql
CREATE TABLE parent_student_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id),
  CHECK (parent_id != student_id)  -- 防止自己关联自己
);

-- 索引
CREATE INDEX idx_parent_student_parent ON parent_student_relations(parent_id);
CREATE INDEX idx_parent_student_student ON parent_student_relations(student_id);
```

**字段说明**：
- `parent_id`: 家长用户 ID
- `student_id`: 学生用户 ID
- 唯一约束：一个家长-学生关系只能有一条记录

#### RLS 策略

```sql
ALTER TABLE parent_student_relations ENABLE ROW LEVEL SECURITY;

-- 家长可以查看自己关联的学生
CREATE POLICY "Parents can view their student relations"
  ON parent_student_relations FOR SELECT
  USING (
    auth.uid() = parent_id OR 
    auth.uid() = student_id
  );

-- 家长可以创建关联（需要验证）
CREATE POLICY "Parents can create student relations"
  ON parent_student_relations FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- 家长可以删除关联
CREATE POLICY "Parents can delete their student relations"
  ON parent_student_relations FOR DELETE
  USING (auth.uid() = parent_id);
```

### API 接口扩展

#### User API 新增方法

```typescript
// 获取用户角色
getUserRole(userId: string): Promise<'parent' | 'student'>

// 家长：获取关联的学生列表
getStudentList(parentId: string): Promise<StudentProfile[]>

// 家长：添加学生关联（需要学生确认或邀请码）
addStudentRelation(parentId: string, studentId: string): Promise<Relation>

// 家长：移除学生关联
removeStudentRelation(parentId: string, studentId: string): Promise<void>

// 家长：查看学生进度
getStudentProgress(parentId: string, studentId: string): Promise<UserProgress>

// 家长：查看学生练习记录
getStudentExerciseRecords(parentId: string, studentId: string): Promise<ExerciseRecord[]>
```

---

## 扩展 2: 发音功能

### 需求分析

- **发音类型**: 字母发音、单词发音、句子发音
- **发音设置**: 用户可以选择是否启用发音、发音音量等
- **发音记录**: 记录用户使用发音功能的统计（可选）
- **发音资源**: 音频文件存储（可以使用 Supabase Storage 或第三方服务）

### 数据库设计

#### 新增字段：user_profiles 表

```sql
-- 修改 user_profiles 表，添加发音设置
ALTER TABLE user_profiles 
ADD COLUMN pronunciation_enabled BOOLEAN DEFAULT true,
ADD COLUMN pronunciation_volume INTEGER DEFAULT 80 CHECK (pronunciation_volume >= 0 AND pronunciation_volume <= 100),
ADD COLUMN letter_pronunciation_enabled BOOLEAN DEFAULT true,
ADD COLUMN word_pronunciation_enabled BOOLEAN DEFAULT true,
ADD COLUMN sentence_pronunciation_enabled BOOLEAN DEFAULT true;
```

#### 新增表：pronunciation_records（发音使用记录表，可选）

```sql
CREATE TABLE pronunciation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pronunciation_type TEXT NOT NULL CHECK (pronunciation_type IN ('letter', 'word', 'sentence')),
  content TEXT NOT NULL,  -- 字母、单词或句子内容
  played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_pronunciation_records_user ON pronunciation_records(user_id);
CREATE INDEX idx_pronunciation_records_type ON pronunciation_records(pronunciation_type);
CREATE INDEX idx_pronunciation_records_date ON pronunciation_records(played_at DESC);
```

**字段说明**：
- `pronunciation_type`: 发音类型（letter/word/sentence）
- `content`: 发音内容（字母、单词或句子）
- `played_at`: 播放时间

**用途**：
- 统计用户使用发音功能的频率
- 分析哪些字母/单词需要更多练习
- 优化发音功能的使用体验

#### 新增表：pronunciation_resources（发音资源表，可选）

如果需要在云端管理发音资源：

```sql
CREATE TABLE pronunciation_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('letter', 'word', 'sentence')),
  content TEXT NOT NULL UNIQUE,  -- 字母、单词或句子
  audio_url TEXT NOT NULL,  -- 音频文件 URL（存储在 Supabase Storage）
  language TEXT DEFAULT 'en-US',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_pronunciation_resources_type ON pronunciation_resources(content_type);
CREATE INDEX idx_pronunciation_resources_content ON pronunciation_resources(content);
```

**字段说明**：
- `content`: 字母、单词或句子内容
- `audio_url`: 音频文件 URL（存储在 Supabase Storage）
- `language`: 语言代码（默认 en-US，未来可扩展多语言）

**存储方案**：
- 方案 1: 使用 Supabase Storage 存储音频文件
- 方案 2: 使用第三方 TTS 服务（如 Google TTS、Azure TTS）实时生成
- 方案 3: 使用 CDN 存储预生成的音频文件

#### RLS 策略

```sql
-- pronunciation_records: 用户只能查看自己的记录
ALTER TABLE pronunciation_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pronunciation records"
  ON pronunciation_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- pronunciation_resources: 所有认证用户可读（系统资源）
ALTER TABLE pronunciation_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pronunciation resources"
  ON pronunciation_resources FOR SELECT
  TO authenticated
  USING (true);
```

### API 接口扩展

#### Pronunciation API 新增方法

```typescript
// 获取用户发音设置
getPronunciationSettings(userId: string): Promise<PronunciationSettings>

// 更新用户发音设置
updatePronunciationSettings(userId: string, settings: Partial<PronunciationSettings>): Promise<PronunciationSettings>

// 获取发音资源（字母）
getLetterPronunciation(letter: string, language?: string): Promise<PronunciationResource | null>

// 获取发音资源（单词）
getWordPronunciation(word: string, language?: string): Promise<PronunciationResource | null>

// 获取发音资源（句子）
getSentencePronunciation(sentence: string, language?: string): Promise<PronunciationResource | null>

// 记录发音使用（可选，用于统计）
recordPronunciationUsage(userId: string, type: 'letter' | 'word' | 'sentence', content: string): Promise<void>

// 获取用户发音使用统计（可选）
getPronunciationStats(userId: string, options?: { type?: string, startDate?: Date, endDate?: Date }): Promise<PronunciationStats[]>
```

---

## 数据迁移考虑

### 现有用户数据迁移

1. **角色迁移**：
   - 所有现有用户默认为 `student` 角色
   - 后续可以通过邀请或注册流程升级为 `parent`

2. **发音设置迁移**：
   - 现有用户的 `sound_enabled` 可以映射到 `pronunciation_enabled`
   - 其他发音设置使用默认值

---

## 实施优先级建议

### Phase 1: 基础功能（当前提案）
- ✅ 用户认证
- ✅ 数据同步
- ✅ 基础 API

### Phase 2: 用户角色系统
- ⏳ 添加角色字段
- ⏳ 实现家长-学生关联
- ⏳ 实现权限控制

### Phase 3: 发音功能
- ⏳ 添加发音设置
- ⏳ 实现发音 API
- ⏳ 集成 TTS 服务或音频资源

---

## 总结

### 需要补充的内容

1. **数据库表**：
   - `parent_student_relations` - 家长-学生关联表
   - `pronunciation_records` - 发音使用记录表（可选）
   - `pronunciation_resources` - 发音资源表（可选）

2. **表字段扩展**：
   - `user_profiles.role` - 用户角色
   - `user_profiles.pronunciation_*` - 发音设置字段

3. **API 接口**：
   - User API: 角色管理、家长-学生关联
   - Pronunciation API: 发音设置、发音资源、发音统计

4. **RLS 策略**：
   - 家长查看学生数据的权限策略
   - 发音资源的访问策略
