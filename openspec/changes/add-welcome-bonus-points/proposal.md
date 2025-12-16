# Change: 新注册学生用户赠送 500 积分

## Why

为了让新用户有更好的初始体验，鼓励他们开始使用打字练习功能。新注册的学生用户将获得 500 积分作为欢迎礼，可以用于兑换礼物。

## What Changes

- 修改 `src/services/auth/auth.service.ts` 的 `signUp` 函数
- 当用户角色为 `student` 时，注册成功后自动赠送 500 积分
- 积分记录原因为"新用户注册奖励"

## Impact

- Affected specs: `points`
- Affected code: `src/services/auth/auth.service.ts`
- 仅影响新注册的学生用户，现有用户不受影响
