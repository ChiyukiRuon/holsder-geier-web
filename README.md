# Holsder Geier Web

🎮 **Hols der Geier** (獴鹫派对) 是一款经典的德国卡牌游戏的在线多人对战版本。本项目是基于 Next.js 和 React 构建的现代化 Web 客户端，提供流畅的实时游戏体验。

## 项目简介

獴鹫派对是一款策略性卡牌游戏，玩家通过出牌争夺分数卡。游戏考验玩家的策略思维和心理博弈能力。

### 核心特性

- **实时多人对战** - 基于 WebSocket 的实时通信，支持多玩家同时在线游戏
- **现代化 UI** - 使用 HeroUI v3 组件库，提供精美的视觉体验
- **即时聊天** - 内置聊天系统，支持文本和表情符号
- **用户系统** - 支持自定义头像、昵称和个人配色
- **房间系统** - 创建或加入房间，与好友一起游戏
- **响应式设计** - 适配不同屏幕尺寸
- **OAuth 登录** - 支持 Google 和 KOOK 第三方登录

## 技术栈

### 前端框架
- **Next.js 16**
- **React 19**
- **TypeScript 5**

### UI 组件
- **HeroUI v3**
- **Tailwind CSS 4**

## 安装与运行

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/ChiyukiRuon/holsder-geier-web.git
cd holsder-geier-web
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

编辑 `.env.local` 文件，配置必要的参数：

```env
# API 服务器地址
SERVER_BASE_URL=/api

# CDN 服务器地址
CDN_BASE_URL=/cdn

# KOOK OAuth 配置
KOOK_CLIENT_ID=your_kook_client_id
KOOK_REDIRECT_URI=http://localhost:3000/koauth
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 游戏玩法

### 基本规则

1. **游戏目标** - 通过出牌争夺分数卡，获得最高分
2. **回合流程**：
   - 每轮翻开一张分数卡
   - 所有玩家同时出一张手牌
   - 根据规则决定谁赢得分数卡
   - 重复直到所有分数卡分配完毕
3. **计分规则** - 正分卡增加分数，负分卡减少分数

### 操作说明

- **加入房间** - 输入房间 ID 或创建新房间
- **准备游戏** - 点击"准备"按钮表示已就绪
- **出牌** - 拖动手牌中的卡片进行出牌
- **聊天互动** - 在右侧聊天框发送消息或表情

## 项目结构

```
holsder-geier-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── koauth/            # KOOK OAuth 回调页面
│   │   ├── layout.tsx         # 根布局组件
│   │   └── page.tsx           # 主游戏页面
│   ├── components/            # React 组件
│   │   ├── ChatMessageItem.tsx    # 聊天消息项
│   │   ├── DynamicHand.tsx        # 动态手牌展示
│   │   ├── EditUserInfo.tsx       # 编辑用户信息
│   │   ├── HandCard.tsx           # 手牌卡片
│   │   ├── ImageCropper.tsx       # 图片裁剪器
│   │   ├── PlayAreaCard.tsx       # 出牌区卡片
│   │   ├── PointCard.tsx          # 分数卡
│   │   └── ShowUserInfo.tsx       # 用户信息展示
│   ├── hooks/                 # 自定义 Hooks
│   │   └── useWebSocket.ts    # WebSocket 连接管理
│   ├── lib/                   # 工具库
│   │   ├── api/               # API 调用
│   │   ├── axios.ts           # Axios 实例配置
│   │   └── ws.ts              # WebSocket 管理器
│   ├── types/                 # TypeScript 类型定义
│   │   ├── base.ts            # 基础类型
│   │   ├── enums.ts           # 枚举类型
│   │   ├── game.ts            # 游戏相关类型
│   │   ├── index.ts           # 类型统一导出
│   │   ├── ws-messages.ts     # WebSocket 消息类型
│   │   └── ws.ts              # WebSocket 连接类型
│   └── utils/                 # 工具函数
│       ├── game.ts            # 游戏逻辑工具
│       ├── upload.ts          # 文件上传工具
│       └── user.ts            # 用户相关工具
├── public/                    # 静态资源
├── .env.example              # 环境变量示例
├── next.config.ts            # Next.js 配置
├── package.json              # 项目依赖
├── tsconfig.json             # TypeScript 配置
└── tailwind.config.ts        # Tailwind CSS 配置
```

## 开发

### 可用脚本

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 许可证

MIT LICENSE

## 相关链接

- [Server 仓库](https://github.com/ChiyukiRuon/holsder-geier-server)
- [Next.js 文档](https://nextjs.org/docs)
- [HeroUI 文档](https://www.heroui.com)

---

**注意**: 本项目需要配合后端服务器使用。请确保后端服务已正确配置并运行。

