import { defineUserConfig } from "vuepress";
import { hopeTheme } from "vuepress-theme-hope";

export default defineUserConfig({
  lang: "zh-CN",
  title: "Core-JS",
  description: "Modular standard library for JavaScript",
  theme: hopeTheme({
    iconAssets: "iconfont",
  }),
});
