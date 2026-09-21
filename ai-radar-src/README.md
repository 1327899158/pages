# AI 雷达 · GitHub Pages

独立静态应用，部署在现有站点的 `/pages/ai-radar/`。原首页与 AI PULSE 页面保留。

`npm ci` 后，`npm run collect` 从公开来源生成资讯快照，`npm run build` 构建前端到 `../ai-radar`。首次收录 71 个来源目录，43 个采集适配。

GitHub Actions 每 30 分钟尝试采集，计划任务可能延迟。单个来源失败时保留上次成功快照，并标明旧数据。全部失败时任务报错。页面刷新读取已发布快照，不触发即时采集。

收藏和来源选择保存在浏览器，不跨设备同步。数据保留出处与原文链接，未接入的来源仅提供访问入口。

## 英文标题翻译

点击“翻译英文标题”，通过 MyMemory 的公开翻译接口把当前列表英文标题译为中文。仅发送公开标题，不发送收藏列表、身份信息或文章正文。译文缓存在当前浏览器，可切回英文，详情内可对照原文。机器翻译仅供参考。

匿名免费服务有额度限制；应用按浏览器每天最多提交 4,500 个字符，服务侧额度也可能提前耗尽。失败或达到限额时显示提示并保留原文。缓存不跨设备同步。

## Google / DeepL / 腾讯云切换

分类栏上方可选择四个翻译来源，每个付费来源的译文独立保存。未配置时显示“未配置”，不会自动改用其他服务。

在仓库 Settings → Secrets and variables → Actions 添加对应 Repository Secrets：

| 服务 | Secret 名称 |
| --- | --- |
| Google Cloud Translation Basic v2 | `GOOGLE_TRANSLATE_API_KEY` |
| DeepL API Free 或 Pro | `DEEPL_API_KEY` |
| 腾讯云机器翻译 TMT | `TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY` |

只添加要使用的服务，并在提供商控制台开通相应 API 和额度。DeepL 根据密钥的 `:fx` 后缀选择 Free 端点。腾讯云使用广州区域。不要把密钥填进源码、网页或聊天记录。

翻译不会随定时采集或代码推送自动运行。点击网站“手动生成译文”打开 Actions，再点击 Run workflow，将 translation_provider 从 none 改为 tencent、google 或 deepl 后运行；只调用选定服务。完成后刷新网页加载译文。默认 none 仅更新资讯。按标题复用历史译文，每轮最多提交 10,000 个新字符，超过部分需再次手动运行。MyMemory 仅在点击翻译或重试时请求当时列表中的标题，切换分类不会自动翻译新标题。

付费服务由 GitHub Actions 调用，网页只读取 `ai-radar/translations/{provider}.json`。未完成或失败的标题保留原文，后续任务继续补充。MyMemory 仍按浏览器点击按需调用。
