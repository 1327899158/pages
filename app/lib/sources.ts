export type SourceGroup = "官方动态" | "中文媒体" | "国际媒体" | "研究论文" | "开发者社区" | "行业通讯";

export type NewsSource = {
  id: string;
  name: string;
  group: SourceGroup;
  region: "中国" | "国际";
  method: "RSS" | "Atom" | "API" | "HTML";
  feedUrl: string;
  siteUrl: string;
  note: string;
  filter?: boolean;
};

export const SOURCES: NewsSource[] = [
  { id: "openai", name: "OpenAI News", group: "官方动态", region: "国际", method: "RSS", feedUrl: "https://openai.com/news/rss.xml", siteUrl: "https://openai.com/news/", note: "官方产品、模型与研究发布" },
  { id: "google-ai", name: "Google AI", group: "官方动态", region: "国际", method: "RSS", feedUrl: "https://blog.google/technology/ai/rss/", siteUrl: "https://blog.google/technology/ai/", note: "Gemini 与 Google AI 产品动态" },
  { id: "deepmind", name: "Google DeepMind", group: "官方动态", region: "国际", method: "RSS", feedUrl: "https://deepmind.google/blog/rss.xml", siteUrl: "https://deepmind.google/discover/blog/", note: "前沿研究、模型与科学进展" },
  { id: "nvidia", name: "NVIDIA AI", group: "官方动态", region: "国际", method: "RSS", feedUrl: "https://blogs.nvidia.com/blog/category/deep-learning/feed/", siteUrl: "https://blogs.nvidia.com/blog/category/deep-learning/", note: "芯片、基础设施与生成式 AI" },
  { id: "aws-ml", name: "AWS Machine Learning", group: "官方动态", region: "国际", method: "RSS", feedUrl: "https://aws.amazon.com/blogs/machine-learning/feed/", siteUrl: "https://aws.amazon.com/blogs/machine-learning/", note: "云端 AI 工程与案例" },
  { id: "meta-eng", name: "Meta Engineering", group: "官方动态", region: "国际", method: "RSS", feedUrl: "https://engineering.fb.com/feed/", siteUrl: "https://engineering.fb.com/category/ai-research/", note: "Meta 工程与开源研究", filter: true },
  { id: "microsoft-research", name: "Microsoft Research", group: "官方动态", region: "国际", method: "RSS", feedUrl: "https://www.microsoft.com/en-us/research/feed/", siteUrl: "https://www.microsoft.com/en-us/research/blog/", note: "微软研究院论文与项目", filter: true },
  { id: "apple-ml", name: "Apple ML Research", group: "官方动态", region: "国际", method: "RSS", feedUrl: "https://machinelearning.apple.com/rss.xml", siteUrl: "https://machinelearning.apple.com/", note: "Apple 机器学习研究" },
  { id: "github-changelog", name: "GitHub Changelog", group: "官方动态", region: "国际", method: "RSS", feedUrl: "https://github.blog/changelog/feed/", siteUrl: "https://github.blog/changelog/", note: "Copilot 与开发者 AI 更新", filter: true },
  { id: "huggingface", name: "Hugging Face Blog", group: "官方动态", region: "国际", method: "Atom", feedUrl: "https://huggingface.co/blog/feed.xml", siteUrl: "https://huggingface.co/blog", note: "模型、数据集与开源生态" },

  { id: "qbitai", name: "量子位", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://www.qbitai.com/feed", siteUrl: "https://www.qbitai.com/", note: "国内 AI 产业与产品快讯" },
  { id: "jiqizhixin", name: "机器之心", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://www.jiqizhixin.com/rss", siteUrl: "https://www.jiqizhixin.com/", note: "人工智能技术与产业报道" },
  { id: "36kr", name: "36氪", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://36kr.com/feed", siteUrl: "https://36kr.com/", note: "商业、创投与科技资讯", filter: true },
  { id: "sspai", name: "少数派", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://sspai.com/feed", siteUrl: "https://sspai.com/", note: "AI 工具、效率与产品体验", filter: true },
  { id: "oschina", name: "开源中国", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://www.oschina.net/news/rss", siteUrl: "https://www.oschina.net/news", note: "开源模型与开发者生态", filter: true },
  { id: "infoq-cn", name: "InfoQ 中文", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://www.infoq.cn/feed", siteUrl: "https://www.infoq.cn/topic/AI", note: "AI 架构、工程与行业观察", filter: true },
  { id: "leiphone", name: "雷峰网", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://www.leiphone.com/feed", siteUrl: "https://www.leiphone.com/category/ai", note: "AI、机器人与智能硬件", filter: true },
  { id: "geekpark", name: "极客公园", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://www.geekpark.net/rss", siteUrl: "https://www.geekpark.net/", note: "科技公司与产品趋势", filter: true },
  { id: "synced-cn", name: "Synced 机器之心英文", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://syncedreview.com/feed/", siteUrl: "https://syncedreview.com/", note: "中国与全球 AI 研究观察" },
  { id: "aihot", name: "AIHOT 精选", group: "中文媒体", region: "中国", method: "RSS", feedUrl: "https://aihot.virxact.com/feed.xml", siteUrl: "https://aihot.virxact.com/daily", note: "公开 RSS 聚合日报；作为二手线索并保留原站跳转" },
  { id: "uisdc-ai", name: "优设 AI 情报", group: "中文媒体", region: "中国", method: "HTML", feedUrl: "https://www.uisdc.com/news", siteUrl: "https://www.uisdc.com/news", note: "每日编辑精选、情报热力值与行动建议" },
  { id: "aiguide", name: "AI 智库导航", group: "中文媒体", region: "中国", method: "HTML", feedUrl: "https://aiguide.cc/", siteUrl: "https://aiguide.cc/", note: "AI 工具、模型、MCP 与智能体最新收录" },
  { id: "aihub", name: "AIHub 资讯", group: "中文媒体", region: "中国", method: "HTML", feedUrl: "https://www.aihub.cn/news/", siteUrl: "https://www.aihub.cn/news/", note: "AI 新闻文章库、产品发布与趋势内容" },

  { id: "techcrunch-ai", name: "TechCrunch AI", group: "国际媒体", region: "国际", method: "RSS", feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/", siteUrl: "https://techcrunch.com/category/artificial-intelligence/", note: "创业、融资与产品发布" },
  { id: "venturebeat-ai", name: "VentureBeat AI", group: "国际媒体", region: "国际", method: "RSS", feedUrl: "https://venturebeat.com/category/ai/feed/", siteUrl: "https://venturebeat.com/category/ai/", note: "企业级 AI 与产业应用" },
  { id: "mit-tr-ai", name: "MIT Technology Review", group: "国际媒体", region: "国际", method: "RSS", feedUrl: "https://www.technologyreview.com/topic/artificial-intelligence/feed/", siteUrl: "https://www.technologyreview.com/topic/artificial-intelligence/", note: "技术影响与深度报道" },
  { id: "verge-ai", name: "The Verge AI", group: "国际媒体", region: "国际", method: "RSS", feedUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", siteUrl: "https://www.theverge.com/ai-artificial-intelligence", note: "消费产品、平台与政策" },
  { id: "ars-ai", name: "Ars Technica AI", group: "国际媒体", region: "国际", method: "RSS", feedUrl: "https://arstechnica.com/ai/feed/", siteUrl: "https://arstechnica.com/ai/", note: "技术新闻与分析" },
  { id: "marktechpost", name: "MarkTechPost", group: "国际媒体", region: "国际", method: "RSS", feedUrl: "https://www.marktechpost.com/feed/", siteUrl: "https://www.marktechpost.com/", note: "论文、模型与工具快讯" },
  { id: "kdnuggets", name: "KDnuggets", group: "国际媒体", region: "国际", method: "RSS", feedUrl: "https://www.kdnuggets.com/feed", siteUrl: "https://www.kdnuggets.com/", note: "数据科学与机器学习" },
  { id: "tds", name: "Towards Data Science", group: "国际媒体", region: "国际", method: "RSS", feedUrl: "https://towardsdatascience.com/feed", siteUrl: "https://towardsdatascience.com/", note: "教程、实践与观点" },
  { id: "mlmastery", name: "Machine Learning Mastery", group: "国际媒体", region: "国际", method: "RSS", feedUrl: "https://machinelearningmastery.com/blog/feed/", siteUrl: "https://machinelearningmastery.com/blog/", note: "机器学习工程教程" },

  { id: "arxiv-ai", name: "arXiv · Artificial Intelligence", group: "研究论文", region: "国际", method: "RSS", feedUrl: "https://rss.arxiv.org/rss/cs.AI", siteUrl: "https://arxiv.org/list/cs.AI/recent", note: "人工智能新论文" },
  { id: "arxiv-cl", name: "arXiv · Computation & Language", group: "研究论文", region: "国际", method: "RSS", feedUrl: "https://rss.arxiv.org/rss/cs.CL", siteUrl: "https://arxiv.org/list/cs.CL/recent", note: "自然语言处理与大模型" },
  { id: "arxiv-lg", name: "arXiv · Machine Learning", group: "研究论文", region: "国际", method: "RSS", feedUrl: "https://rss.arxiv.org/rss/cs.LG", siteUrl: "https://arxiv.org/list/cs.LG/recent", note: "机器学习新论文" },
  { id: "arxiv-cv", name: "arXiv · Computer Vision", group: "研究论文", region: "国际", method: "RSS", feedUrl: "https://rss.arxiv.org/rss/cs.CV", siteUrl: "https://arxiv.org/list/cs.CV/recent", note: "视觉与多模态研究" },
  { id: "arxiv-ro", name: "arXiv · Robotics", group: "研究论文", region: "国际", method: "RSS", feedUrl: "https://rss.arxiv.org/rss/cs.RO", siteUrl: "https://arxiv.org/list/cs.RO/recent", note: "机器人与具身智能" },
  { id: "bair", name: "Berkeley AI Research", group: "研究论文", region: "国际", method: "Atom", feedUrl: "https://bair.berkeley.edu/blog/feed.xml", siteUrl: "https://bair.berkeley.edu/blog/", note: "伯克利 AI 研究博客" },
  { id: "gradient", name: "The Gradient", group: "研究论文", region: "国际", method: "RSS", feedUrl: "https://thegradient.pub/rss/", siteUrl: "https://thegradient.pub/", note: "AI 研究评论与观点" },
  { id: "lilian-weng", name: "Lilian Weng", group: "研究论文", region: "国际", method: "Atom", feedUrl: "https://lilianweng.github.io/index.xml", siteUrl: "https://lilianweng.github.io/", note: "深度技术长文" },

  { id: "hackernews-ai", name: "Hacker News · AI", group: "开发者社区", region: "国际", method: "API", feedUrl: "https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=30", siteUrl: "https://news.ycombinator.com/", note: "开发者社区最新 AI 讨论" },
  { id: "hackernews-llm", name: "Hacker News · LLM", group: "开发者社区", region: "国际", method: "API", feedUrl: "https://hn.algolia.com/api/v1/search_by_date?query=LLM&tags=story&hitsPerPage=20", siteUrl: "https://news.ycombinator.com/", note: "LLM 工具与开源项目讨论" },
  { id: "simon-willison", name: "Simon Willison", group: "开发者社区", region: "国际", method: "Atom", feedUrl: "https://simonwillison.net/atom/everything/", siteUrl: "https://simonwillison.net/", note: "LLM 开发、工具与实测", filter: true },

  { id: "lastweekinai", name: "Last Week in AI", group: "行业通讯", region: "国际", method: "RSS", feedUrl: "https://lastweekin.ai/feed", siteUrl: "https://lastweekin.ai/", note: "AI 新闻周报与深度梳理" },
  { id: "importai", name: "Import AI", group: "行业通讯", region: "国际", method: "RSS", feedUrl: "https://www.importai.net/feed", siteUrl: "https://www.importai.net/", note: "研究与政策 Newsletter" },
  { id: "raschka", name: "Ahead of AI", group: "行业通讯", region: "国际", method: "Atom", feedUrl: "https://magazine.sebastianraschka.com/feed", siteUrl: "https://magazine.sebastianraschka.com/", note: "大模型研究与工程解析" },
];

export const WATCHLIST = [
  { name: "Anthropic News", type: "官网监测", reason: "暂无稳定公开 RSS；使用官方新闻页变更监测或邮件订阅", url: "https://www.anthropic.com/news" },
  { name: "Mistral AI", type: "官网监测", reason: "RSS 可用性波动；使用官网新闻页与 GitHub Releases 双通道", url: "https://mistral.ai/news" },
  { name: "xAI", type: "官网监测", reason: "使用官方新闻页及 X 官方账号，需平台授权", url: "https://x.ai/news" },
  { name: "DeepSeek", type: "官网/GitHub", reason: "官网公告配合官方 GitHub Releases", url: "https://github.com/deepseek-ai" },
  { name: "阿里通义", type: "官网/公众号", reason: "官网模型动态可监测；公众号全文需管理员授权", url: "https://tongyi.aliyun.com/" },
  { name: "腾讯混元", type: "官网/公众号", reason: "官网与官方公众号双通道，公众号不绕过登录抓取", url: "https://hunyuan.tencent.com/" },
  { name: "百度文心", type: "官网/公众号", reason: "官方动态页与公众号授权接入", url: "https://yiyan.baidu.com/" },
  { name: "智谱 AI", type: "官网/公众号", reason: "官网新闻与公众号授权接入", url: "https://www.zhipuai.cn/" },
  { name: "月之暗面 Kimi", type: "官网/公众号", reason: "官网产品公告与公众号授权接入", url: "https://www.moonshot.cn/" },
  { name: "MiniMax", type: "官网/公众号", reason: "官网更新与公众号授权接入", url: "https://www.minimax.io/" },
  { name: "字节豆包/火山方舟", type: "官网/公众号", reason: "产品文档更新与公众号授权接入", url: "https://www.volcengine.com/product/ark" },
  { name: "澎湃·未来2%", type: "网页监测", reason: "遵守 robots.txt 的栏目页增量采集", url: "https://www.thepaper.cn/" },
  { name: "财新科技", type: "付费媒体", reason: "仅聚合公开标题与链接，不抓取付费全文", url: "https://www.caixin.com/tech/" },
  { name: "微信公众号矩阵", type: "授权接入", reason: "支持管理员导入文章链接/邮件转发；不绕过微信登录与反爬", url: "https://mp.weixin.qq.com/" },
  { name: "X / Twitter 研究者列表", type: "公开读取 / 官方 API", reason: "默认使用公开页面读取并保留原帖链接；配置官方 API 后自动切换为高可靠模式", url: "https://x.com/" },
  { name: "Reddit AI 社区", type: "平台 API", reason: "建议配置 Reddit API；公开 RSS 在部分网络环境不稳定", url: "https://www.reddit.com/r/MachineLearning/" },
  { name: "YouTube AI 频道", type: "公开 Atom", reason: "可按频道 ID 接入官方 Atom Feed，视频仅保存元数据", url: "https://www.youtube.com/" },
  { name: "Product Hunt AI", type: "GraphQL API", reason: "需要 Product Hunt API Token", url: "https://www.producthunt.com/topics/artificial-intelligence" },
];

export const AI_PATTERN = /\b(ai|a\.i\.|llm|gpt|gemini|claude|copilot|machine learning|deep learning|neural|agentic|agents?|generative|foundation model|language model|computer vision|robotics?)\b|人工智能|大模型|生成式|智能体|机器学习|深度学习|神经网络|机器人|具身智能|多模态|模型|算力|芯片/i;

