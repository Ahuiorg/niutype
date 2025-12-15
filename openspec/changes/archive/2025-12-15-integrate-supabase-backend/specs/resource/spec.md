# Resource Module Specification

## ADDED Requirements

### Requirement: Pronunciation Settings
系统 SHALL 支持用户配置发音功能设置，包括是否启用发音、音量控制等。

#### Scenario: 获取用户发音设置
- **Given**: 用户已登录
- **When**: 调用 `getPronunciationSettings(userId)`
- **Then**:
  - 从 `user_profiles` 表查询用户的发音设置
  - 返回发音设置对象（包括 pronunciation_enabled, volume, 各类型发音开关等）
  - 如果不存在，返回默认设置

#### Scenario: 更新用户发音设置
- **Given**: 用户已登录
- **When**: 用户在设置页面修改发音设置并保存
- **Then**:
  - 更新 `user_profiles` 表中的发音设置字段
  - 验证设置值的有效性（音量范围 0-100）
  - 返回更新后的设置

### Requirement: Letter Pronunciation Resources
系统 SHALL 支持字母发音资源的管理和获取。

#### Scenario: 获取字母发音资源
- **Given**: 用户需要播放字母发音
- **When**: 调用 `getLetterPronunciation(letter, language)`
- **Then**:
  - 从 `pronunciation_resources` 表查询字母的音频资源
  - 如果不存在，返回 null（前端可以使用 TTS 生成）
  - 返回音频 URL 或资源对象

#### Scenario: 播放字母发音
- **Given**: 用户在打字练习中
- **When**: 用户按下字母键或点击字母
- **Then**:
  - 检查 `letter_pronunciation_enabled` 设置
  - 如果启用，获取字母发音并播放
  - 记录发音使用（如果启用统计）

### Requirement: Word Pronunciation Resources
系统 SHALL 支持单词发音资源的管理和获取。

#### Scenario: 获取单词发音资源
- **Given**: 用户需要播放单词发音
- **When**: 调用 `getWordPronunciation(word, language)`
- **Then**:
  - 从 `pronunciation_resources` 表查询单词的音频资源
  - 如果不存在，返回 null（前端可以使用 TTS 生成）
  - 返回音频 URL 或资源对象

#### Scenario: 播放单词发音
- **Given**: 用户在打字练习中
- **When**: 用户完成一个单词的输入
- **Then**:
  - 检查 `word_pronunciation_enabled` 设置
  - 如果启用，获取单词发音并播放
  - 记录发音使用（如果启用统计）

### Requirement: Sentence Pronunciation Resources
系统 SHALL 支持句子发音资源的管理和获取。

#### Scenario: 获取句子发音资源
- **Given**: 用户需要播放句子发音
- **When**: 调用 `getSentencePronunciation(sentence, language)`
- **Then**:
  - 从 `pronunciation_resources` 表查询句子的音频资源
  - 如果不存在，返回 null（前端可以使用 TTS 生成）
  - 返回音频 URL 或资源对象

#### Scenario: 播放句子发音
- **Given**: 用户在打字练习中
- **When**: 用户完成一个句子的输入
- **Then**:
  - 检查 `sentence_pronunciation_enabled` 设置
  - 如果启用，获取句子发音并播放
  - 记录发音使用（如果启用统计）

### Requirement: Word Resources
系统 SHALL 支持单词资源的管理，包括单词定义、例句等。

#### Scenario: 获取单词资源
- **Given**: 用户需要单词信息
- **When**: 调用 `getWordResource(word)`
- **Then**:
  - 从 `word_resources` 表查询单词资源
  - 返回单词信息（定义、例句、图片等）
  - 如果不存在，返回 null

### Requirement: Sentence Resources
系统 SHALL 支持句子资源的管理，包括句子内容、难度等。

#### Scenario: 获取句子资源
- **Given**: 用户需要句子信息
- **When**: 调用 `getSentenceResource(sentence)`
- **Then**:
  - 从 `sentence_resources` 表查询句子资源
  - 返回句子信息（内容、难度、分类等）
  - 如果不存在，返回 null

### Requirement: Textbook Resources (Future)
系统 SHALL 支持课本资源的管理，为未来扩展做准备。

#### Scenario: 获取课本资源列表
- **Given**: 用户需要查看可用课本
- **When**: 调用 `getTextbookResources(options)`
- **Then**:
  - 从 `textbook_resources` 表查询课本列表
  - 支持按年级、难度等筛选
  - 返回课本资源数组

#### Scenario: 获取课本详情
- **Given**: 用户选择某个课本
- **When**: 调用 `getTextbookById(textbookId)`
- **Then**:
  - 从 `textbook_resources` 表查询课本详情
  - 返回课本信息（名称、描述、章节列表等）

### Requirement: Pronunciation Usage Statistics (Optional)
系统 SHALL 可选地记录用户使用发音功能的统计信息。

#### Scenario: 记录发音使用
- **Given**: 用户启用了发音统计
- **When**: 用户播放了字母/单词/句子发音
- **Then**:
  - 在 `pronunciation_records` 表中插入记录
  - 记录发音类型、内容和播放时间
  - 不影响用户体验（异步记录）

#### Scenario: 获取发音使用统计
- **Given**: 用户已登录
- **When**: 调用 `getPronunciationStats(userId, options)`
- **Then**:
  - 从 `pronunciation_records` 表查询用户的发音使用记录
  - 支持按类型、日期范围筛选
  - 返回统计结果（使用频率、常用字母/单词等）

### Requirement: Resource Storage
系统 SHALL 支持资源文件的存储管理。

#### Scenario: 使用 Supabase Storage 存储音频
- **Given**: 需要存储发音音频文件
- **When**: 上传音频文件
- **Then**:
  - 文件存储在 Supabase Storage 的 `resources` bucket
  - 在资源表中记录资源信息
  - 返回可访问的资源 URL

#### Scenario: 使用 TTS 服务实时生成发音
- **Given**: 发音资源不存在
- **When**: 需要播放发音
- **Then**:
  - 调用 TTS 服务（如 Web Speech API 或第三方服务）生成音频
  - 可选：将生成的音频缓存到 Supabase Storage
  - 播放生成的音频
