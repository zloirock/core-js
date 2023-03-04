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
      children: "structure",
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
