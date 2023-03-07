import { hopeTheme } from "vuepress-theme-hope";
import { navbarEn, navbarZh } from "./navbar/index.js";
import { sidebarEn, sidebarZh } from "./sidebar/index.js";

export default hopeTheme({
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
  copyright: `&copy; 2014-${new Date().getFullYear()} zloirock and contributors`,
  displayFooter: true,
  plugins: {
    blog: true,
    mdEnhance: {
      attrs: true,
      imgLazyload: true,
      tasklist: true,
    },
  },
});
