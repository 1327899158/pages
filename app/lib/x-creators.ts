export type XCreator = {
  username: string;
  name: string;
  category: "研究领袖" | "产业领袖" | "AI 工程与产品" | "高传播资讯";
  tier: "核心观察" | "传播观察";
  focus: string;
  reason: string;
};

// 观察池强调“AI 议题影响力 + 持续原创输出 + 可追溯身份”，不只按粉丝量排序。
// “传播观察”账号适合发现线索，涉及发布、融资和性能结论时应回到官方来源复核。
export const X_CREATORS: XCreator[] = [
  { username: "karpathy", name: "Andrej Karpathy", category: "研究领袖", tier: "核心观察", focus: "大模型、AI 编程、教育", reason: "AI 工程与教育领域最具传播力的研究者之一" },
  { username: "ylecun", name: "Yann LeCun", category: "研究领袖", tier: "核心观察", focus: "世界模型、机器学习路线", reason: "图灵奖得主，持续讨论 LLM 边界与下一代架构" },
  { username: "geoffreyhinton", name: "Geoffrey Hinton", category: "研究领袖", tier: "核心观察", focus: "深度学习、AI 风险", reason: "深度学习奠基者，对能力与风险议题影响显著" },
  { username: "AndrewYNg", name: "Andrew Ng", category: "研究领袖", tier: "核心观察", focus: "AI 教育、智能体、产业实践", reason: "连接研究、教育与企业落地的高影响力声音" },
  { username: "DrJimFan", name: "Jim Fan", category: "研究领袖", tier: "核心观察", focus: "具身智能、机器人、基础智能体", reason: "具身智能与基础智能体研究的活跃解读者" },
  { username: "fchollet", name: "François Chollet", category: "研究领袖", tier: "核心观察", focus: "抽象推理、AGI 评测", reason: "ARC-AGI 发起人，持续讨论泛化与智能边界" },
  { username: "drfeifei", name: "Fei-Fei Li", category: "研究领袖", tier: "核心观察", focus: "计算机视觉、空间智能", reason: "计算机视觉领军学者，关注以人为本的 AI" },
  { username: "hardmaru", name: "David Ha", category: "研究领袖", tier: "核心观察", focus: "世界模型、生成模型", reason: "世界模型与开放研究社区的重要研究者" },
  { username: "lilianweng", name: "Lilian Weng", category: "研究领袖", tier: "核心观察", focus: "大模型、智能体、研究综述", reason: "以高质量技术综述和研究判断著称" },
  { username: "rasbt", name: "Sebastian Raschka", category: "研究领袖", tier: "核心观察", focus: "LLM 训练、开源模型", reason: "大模型工程与论文解读的高质量创作者" },
  { username: "jeremyphoward", name: "Jeremy Howard", category: "研究领袖", tier: "核心观察", focus: "深度学习教育、开源", reason: "fast.ai 联合创始人，擅长解释可落地的研究进展" },

  { username: "sama", name: "Sam Altman", category: "产业领袖", tier: "核心观察", focus: "前沿模型、AI 产业", reason: "OpenAI 重要产品与战略信号源" },
  { username: "demishassabis", name: "Demis Hassabis", category: "产业领袖", tier: "核心观察", focus: "AGI、AI for Science", reason: "Google DeepMind CEO，研究和产品发布影响广泛" },
  { username: "AravSrinivas", name: "Aravind Srinivas", category: "产业领袖", tier: "核心观察", focus: "AI 搜索、智能体产品", reason: "Perplexity CEO，活跃讨论 AI 搜索与产品竞争" },
  { username: "mustafasuleyman", name: "Mustafa Suleyman", category: "产业领袖", tier: "核心观察", focus: "消费级 AI、治理", reason: "Microsoft AI CEO，兼具产品与治理视角" },
  { username: "ClementDelangue", name: "Clément Delangue", category: "产业领袖", tier: "核心观察", focus: "开源模型、Hugging Face 生态", reason: "开源 AI 社区与模型生态的重要信号源" },
  { username: "aidangomez", name: "Aidan Gomez", category: "产业领袖", tier: "核心观察", focus: "Transformer、企业级模型", reason: "Transformer 论文作者、Cohere CEO" },
  { username: "natfriedman", name: "Nat Friedman", category: "产业领袖", tier: "核心观察", focus: "AI 创业、开发工具、科研", reason: "对 AI 创业项目与开发者生态有较强扩散能力" },
  { username: "alexandr_wang", name: "Alexandr Wang", category: "产业领袖", tier: "核心观察", focus: "数据、国防 AI、产业政策", reason: "数据基础设施与产业政策领域的高关注人物" },

  { username: "emollick", name: "Ethan Mollick", category: "AI 工程与产品", tier: "核心观察", focus: "AI 工作方式、教育、实测", reason: "以严谨、可复现的 AI 产品实测著称" },
  { username: "simonw", name: "Simon Willison", category: "AI 工程与产品", tier: "核心观察", focus: "LLM 工具、模型实测、开源", reason: "开发者社区最可靠的 LLM 更新与实测来源之一" },
  { username: "swyx", name: "swyx", category: "AI 工程与产品", tier: "核心观察", focus: "AI 工程、智能体、开发者生态", reason: "AI Engineer 社区建设者与趋势观察者" },
  { username: "goodside", name: "Riley Goodside", category: "AI 工程与产品", tier: "核心观察", focus: "提示工程、模型行为", reason: "模型行为与提示工程领域的高影响力实践者" },
  { username: "OfficialLoganK", name: "Logan Kilpatrick", category: "AI 工程与产品", tier: "核心观察", focus: "开发者平台、模型 API", reason: "长期活跃于模型开发者关系与产品发布一线" },
  { username: "hwchase17", name: "Harrison Chase", category: "AI 工程与产品", tier: "核心观察", focus: "智能体、LangChain、评测", reason: "智能体工程生态的核心建设者" },
  { username: "jerryjliu0", name: "Jerry Liu", category: "AI 工程与产品", tier: "核心观察", focus: "RAG、智能体、LlamaIndex", reason: "企业级 RAG 与智能体工程的重要创作者" },
  { username: "chipro", name: "Chip Huyen", category: "AI 工程与产品", tier: "核心观察", focus: "AI 工程、推理、数据系统", reason: "AI 工程化和生产系统领域的高质量作者" },
  { username: "sh_reya", name: "Shreya Shankar", category: "AI 工程与产品", tier: "核心观察", focus: "评测、数据系统、AI 工程", reason: "生产级 AI 评测与数据质量研究者" },
  { username: "levelsio", name: "Pieter Levels", category: "AI 工程与产品", tier: "传播观察", focus: "独立开发、AI 产品", reason: "独立 AI 产品的高传播实践者，适合观察用户侧趋势" },
  { username: "bindureddy", name: "Bindu Reddy", category: "AI 工程与产品", tier: "传播观察", focus: "模型产品、创业", reason: "高频讨论模型发布、产品竞争与创业机会" },

  { username: "rowancheung", name: "Rowan Cheung", category: "高传播资讯", tier: "传播观察", focus: "AI 快讯、产品应用", reason: "AI 快讯与 Newsletter 领域的高传播账号" },
  { username: "TheRundownAI", name: "The Rundown AI", category: "高传播资讯", tier: "传播观察", focus: "每日 AI 新闻、工具", reason: "大型 AI Newsletter 官方账号，更新频率高" },
  { username: "bensbitesdaily", name: "Ben's Bites", category: "高传播资讯", tier: "传播观察", focus: "AI 产品、创业、工具", reason: "AI 产品与创业线索的高频聚合账号" },
  { username: "mattshumer_", name: "Matt Shumer", category: "高传播资讯", tier: "传播观察", focus: "智能体、模型实测、创业", reason: "模型实测和智能体演示传播速度快" },
  { username: "omarsar0", name: "Elvis Saravia", category: "高传播资讯", tier: "传播观察", focus: "AI 论文、教程、工具", reason: "论文、工具和学习资源的高频策展者" },
  { username: "_akhaliq", name: "AK", category: "高传播资讯", tier: "传播观察", focus: "新论文、模型 Demo", reason: "机器学习论文与模型演示的早期线索源" },
  { username: "heyBarsee", name: "Barsee", category: "高传播资讯", tier: "传播观察", focus: "生成式 AI、工具快讯", reason: "生成式 AI 工具与视觉模型的高传播账号" },
  { username: "itsPaulAi", name: "Paul Couvert", category: "高传播资讯", tier: "传播观察", focus: "AI 工具、工作流", reason: "面向大众的 AI 工具和工作流传播账号" },
];

export const X_CREATOR_MAP = new Map(X_CREATORS.map((creator) => [creator.username.toLowerCase(), creator]));

export const X_CATEGORY_ORDER = ["研究领袖", "产业领袖", "AI 工程与产品", "高传播资讯"] as const;

