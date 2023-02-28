import { defineUserConfig } from "vuepress";
import { getDirname, path } from "@vuepress/utils";
import { hopeTheme } from "vuepress-theme-hope";
import searchPlugin from "@vuepress/plugin-search";
import { navbarEn, navbarZh } from "./navbar/index.js";
import { sidebarEn, sidebarZh } from "./sidebar/index.js";

const __dirname = getDirname(import.meta.url);
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
    copyright: `&copy 2014-${new Date().getFullYear()} zloirock and contributors`,
    displayFooter: true,
    plugins: {
      blog: {
        article: "/blog/",
        filter: (page) => /^((\/zh)?\/blog\/(.+))/.test(page.path),
      },
      mdEnhance: {
        attrs: true,
        imgLazyload: true,
        tasklist: true,
      },
    },
  }),
  alias: {
    "@compat-tests": () =>
      path.resolve(__dirname, "..", "..", "tests", "compat", "tests.js"),
  },
  plugins: [searchPlugin],
});
