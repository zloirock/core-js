import { sidebar } from "vuepress-theme-hope";

export const sidebarZh = sidebar({
  "/zh/": [
    {
      text: "指南",
      icon: "creative",
      prefix: "guide/",
      children: "structure",
      collapsible: true,
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
          text: "工具函数",
          icon: "function",
          prefix: "helper/",
          children: "structure",
          collapsible: true,
        },
      ],
      collapsible: true,
    },
    {
      text: "贡献",
      icon: "tree",
      prefix: "dev/",
      children: [
        {
          text: "如何贡献",
          icon: "question",
          link: "README.md",
        },
        {
          text: "添加新的 polyfill",
          icon: "code",
          link: "polyfill.md",
        },
        {
          text: "测试",
          icon: "check",
          link: "testing.md",
        },
        {
          text: "更新core-js-compat",
          icon: "form",
          link: "compat.md",
        },
        {
          text: "撰写文档",
          icon: "form",
          prefix: "docs/",
          children: [
            {
              text: "撰写文档",
              icon: "form",
              link: "README.md",
            },
            {
              text: "为 polyfill 创建文档",
              icon: "code",
              link: "polyfill.md",
            },
            {
              text: "翻译",
              icon: "language",
              link: "translate.md",
            },
          ],
          collapsible: true,
        },
      ],
      collapsible: true,
    },
    {
      text: "项目",
      icon: "more",
      prefix: "project/",
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
