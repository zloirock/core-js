import { defineUserConfig } from "vuepress";
import { hopeTheme } from "vuepress-theme-hope";
import searchPlugin from "@vuepress/plugin-search";
import { navbarEn, navbarZh } from "./navbar/index.js";
import { sidebarEn, sidebarZh } from "./sidebar/index.js";

export default defineUserConfig({
  lang: "en-US",
  title: "Core-JS",
  description: "Modular standard library for JavaScript",
  locales: {
    "/": {
      lang: "en-US",
    },
    "/zh/": {
      lang: "zh-CN",
    },
  },
  theme: hopeTheme({
    favicon: "logo.png",
    repo: "https://github.com/zloirock/core-js",
    iconAssets: "iconfont",
    locales: {
      "/": {
        navbar: navbarEn,
        sidebar: sidebarEn,
      },
      "/zh/": {
        navbar: navbarZh,
        sidebar: sidebarZh,
      },
    },
    copyright: "&copy 2014-2023 zloirock and contributors",
    plugins: {
      mdEnhance: {
        imgLazyload: true,
        tasklist: true,
      },
    },
  }),
  plugins: [searchPlugin()],
});
