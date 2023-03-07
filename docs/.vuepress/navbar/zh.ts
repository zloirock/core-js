import { navbar } from "vuepress-theme-hope";

export const navbarZh = navbar([
  {
    text: "指南",
    link: "/zh/guide/",
    icon: "creative",
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
