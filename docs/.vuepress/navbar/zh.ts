import { navbar } from "vuepress-theme-hope";

export const navbarZh = navbar([
  {
    text: "指南",
    link: "/zh/guide/",
    icon: "creative",
  },
  {
    text: "功能",
    icon: "object",
    prefix: "/zh/features/",
    children: [
      {
        text: "ES 标准",
        link: "es-standard/README.md",
        icon: "javascript",
      },
      {
        text: "ES 提案",
        link: "es-proposal/README.md",
        icon: "proposal",
      },
      {
        text: "Web 标准",
        link: "web-standard/README.md",
        icon: "link",
      },
      {
        text: "工具函数",
        link: "helper/README.md",
        icon: "function",
      },
    ],
  },
  {
    text: "贡献",
    prefix: "/zh/dev/",
    icon: "tree",
    children: [
      {
        text: "指南",
        icon: "question",
        link: "README.md",
      },
      {
        text: "Polyfill",
        icon: "code",
        link: "polyfill.md",
      },
      {
        text: "兼容性数据",
        icon: "form",
        link: "compat.md",
      },
      {
        text: "文档",
        icon: "article",
        link: "docs/README.md",
      },
    ],
  },
  {
    text: "项目",
    prefix: "/zh/",
    icon: "more",
    children: [
      {
        text: "关于",
        icon: "info",
        link: "project/README.md",
      },
      {
        text: "变更日志",
        icon: "time",
        link: "project/changelog.md",
      },
      {
        text: "安全策略",
        icon: "safe",
        link: "project/security.md",
      },
      {
        text: "路线图",
        icon: "state",
        link: "project/roadmap.md",
      },
      {
        text: "博客",
        link: "category/blog",
        icon: "blog",
      },
    ],
  },
  {
    text: "兼容性",
    link: "/zh/compat.md",
    icon: "form",
  },
  {
    text: "赞助",
    link: "/zh/donate.md",
    icon: "like",
  },
]);
