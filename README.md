# 轻卡日记

个人热量管理与减脂规划微信小程序，核心流程为：身体建档 → 饮食/运动记录 → 每日热量差 → 目标趋势。

## 启动

完整操作和手机微信扫码步骤见工作区根目录的 [小程序启动与手机扫码预览](../../小程序启动与手机扫码预览.md)，对应 PDF 在 `../../output/pdf/`。旧的“程序启动步骤.pdf”和历史二维码不代表当前配置。

1. 进入 `SlimmingDietBack`，复制 `.env.example` 中需要的配置到 `.env`。
2. 首次运行或模型变更后执行 `npm run migrate`。
3. 执行 `npm run dev` 启动 `http://localhost:3000`。
4. 使用 HBuilderX 打开当前目录，运行到微信开发者工具。
5. 开发者工具中开启“不校验合法域名”，点击“一键体验”。

## 识餐模式

- 默认：`RECOGNITION_PROVIDER=local`，自部署 Chinese-CLIP，使用本地成品食物库。安装见 [拍照识餐说明](FOOD_RECOGNITION.md)。
- 拍照后先显示参考份量的总热量，用户核对菜品、整份重量和实际食用比例后才能保存。
- `mock` 仅供开发测试，模拟结果不能直接记账；本地模型失败时不会自动返回模拟结果。
- 保留可选百度适配器，默认本地流程不需要百度密钥。

供应商密钥仅保存在后端环境变量中，不写入小程序代码。上传图片识别后立即释放，不保存原图。

## 验证

```powershell
cd SlimmingDietBack
npm test
npm run validate:frontend
```
