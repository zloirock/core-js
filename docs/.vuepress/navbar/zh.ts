import { navbar } from "vuepress-theme-hope";

export const navbarZh = navbar([
  {
    text: "指南",
    link: "/zh/guide/",
    icon: "creative",
  },
  {
    text: "开发",
    link: "/zh/dev/",
    icon: "debug",
  },
  {
    text: "兼容性",
    link: "/zh/compat.md",
    icon: "form",
  },
  {
    text: "关于",
    prefix: "/zh/about/",
    icon: "more",
    children: [
      {
        text: "本项目",
        icon: "info",
        link: "README.md",
      },
      {
        text: "变更日志",
        icon: "time",
        link: "changelog.md",
      },
    ],
  },
  {
    text: "博客",
    link: "/zh/blog",
    icon: "blog",
  },
  {
    text: "赞助",
    link: "/zh/donate.md",
    icon: "like",
  },
]);
