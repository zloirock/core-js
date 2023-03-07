import { sidebar } from "vuepress-theme-hope";

export const sidebarZh = sidebar({
  "/zh/": [
    {
      text: "指南",
      icon: "creative",
      prefix: "guide/",
      children: "structure",
    },
    {
      text: "功能",
      icon: "object",
      prefix: "features/",
      children: [
        {
          text: "概述",
          icon: "info",
          link: "README.md",
        },
        {
          text: "缺失的 Polyfill",
          icon: "notice",
          link: "missing-polyfills.md",
        },
        {
          text: "ES 标准",
          icon: "javascript",
          prefix: "es-standard/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "ES 提案",
          icon: "proposal",
          prefix: "es-proposal/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "Web 标准",
          icon: "link",
          prefix: "web-standard/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "Helper函数",
          icon: "function",
          prefix: "helper/",
          children: "structure",
          collapsible: true,
        },
      ],
      collapsible: true,
    },
    {
      text: "开发",
      icon: "debug",
      prefix: "dev/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "关于",
      icon: "about",
      prefix: "about/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "赞助",
      icon: "like",
      link: "donate.md",
    },
  ],
});
