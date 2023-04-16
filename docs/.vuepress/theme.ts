import { hopeTheme } from "vuepress-theme-hope";
import { navbarEn, navbarZh } from "./navbar/index.js";
import { sidebarEn, sidebarZh } from "./sidebar/index.js";

export default hopeTheme(
  {
    favicon: "logo.png",
    repo: "https://github.com/zloirock/core-js",
    docsBranch: "master",
    docsDir: "docs",
    iconAssets: "iconfont",
    locales: {
      "/": {
        navbar: navbarEn,
        sidebar: sidebarEn,
        copyright: `&copy; 2014-${new Date().getFullYear()} Core-JS contributors`,
      },
      "/zh/": {
        navbar: navbarZh,
        sidebar: sidebarZh,
        copyright: `&copy; 2014-${new Date().getFullYear()} Core-JS 贡献者`,
      },
    },
    displayFooter: true,
    plugins: {
      autoCatalog: {
        locales: {
          "/": { title: "Index" },
          "/zh/": { title: "索引" },
        },
      },
      blog: true,
      mdEnhance: {
        attrs: true,
        tabs: true,
        imgLazyload: true,
        include: true,
        tasklist: true,
        codetabs: true,
      },
      prismjs: false,
    },
  },
  {
    custom: true,
  }
);
