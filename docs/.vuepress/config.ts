import { defineUserConfig } from "vuepress";
import { hopeTheme } from "vuepress-theme-hope";
import searchPlugin from "@vuepress/plugin-search";

export default defineUserConfig({
  lang: "en-US",
  title: "Core-JS",
  description: "Modular standard library for JavaScript",
  theme: hopeTheme({
    favicon: "logo.png",
    repo: "https://github.com/zloirock/core-js",
    iconAssets: "iconfont",
    navbar: [
      {
        text: "Guide",
        link: "/guide/",
        icon: "creative",
      },
      {
        text: "Develope",
        link: "/dev/",
        icon: "guide",
      },
      {
        text: "Compat Data",
        link: "/compat/",
        icon: "form",
      },
      {
        text: "About",
        link: "/about.md",
        icon: "info",
      },
      {
        text: "Sponsor",
        link: "/donate.md",
        icon: "like",
      },
    ],
    sidebar: "structure",
    copyright: "&copy 2014-2023 zloirock and contributors",
  }),
  plugins: [searchPlugin()],
});
