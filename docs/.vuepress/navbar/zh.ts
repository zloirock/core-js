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
        text: "Helper函数",
        link: "helper/README.md",
        icon: "function",
      },
    ],
  },
  {
    text: "贡献",
    link: "/zh/dev/",
    icon: "tree",
  },
  {
    text: "兼容性",
    link: "/zh/compat.md",
    icon: "form",
  },
  {
    text: "项目",
    prefix: "/zh/about/",
    icon: "more",
    children: [
      {
        text: "关于",
        icon: "info",
        link: "README.md",
      },
      {
        text: "变更日志",
        icon: "time",
        link: "changelog.md",
      },
      {
        text: "博客",
        link: "/zh/category/blog",
        icon: "blog",
      },
    ],
  },
  {
    text: "赞助",
    link: "/zh/donate.md",
    icon: "like",
  },
]);
