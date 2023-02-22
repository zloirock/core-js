import { defineUserConfig } from "vuepress";
import { hopeTheme } from "vuepress-theme-hope";

export default defineUserConfig({
  lang: "zh-CN",
  title: "Core-JS",
  description: "Modular standard library for JavaScript",
  theme: hopeTheme({
    favicon: "logo.png",
    repo: "https://github.com/zloirock/core-js",
    iconAssets: "iconfont",
    navbar: [
      {
        text: "Sponsor",
        link: "/donate.md",
        icon: "linke",
      },
    ],
    sidebar: "structure",
    copyright: "&copy 2014-2023 zloirock and contributors",
  }),
});
