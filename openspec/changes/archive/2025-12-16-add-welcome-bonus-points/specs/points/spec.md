## ADDED Requirements

### Requirement: Welcome Bonus Points
系统 SHALL 为新注册的学生用户赠送 500 积分作为欢迎礼。

#### Scenario: 学生注册获得欢迎积分
- **GIVEN**: 用户以 `student` 角色完成注册
- **WHEN**: 注册流程成功完成
- **THEN**:
  - 自动赠送 500 积分
  - 在 `points_transactions` 表中记录交易，原因为"新用户注册奖励"
  - 用户可在积分记录中查看该笔交易

#### Scenario: 家长注册不获得欢迎积分
- **GIVEN**: 用户以 `parent` 角色完成注册
- **WHEN**: 注册流程成功完成
- **THEN**: 不赠送任何积分
