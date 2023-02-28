import { sidebar } from "vuepress-theme-hope";
export const sidebarEn = sidebar({
  "/": [
    {
      text: "Guide",
      icon: "creative",
      prefix: "guide/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "Develop",
      icon: "debug",
      prefix: "dev/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "About",
      icon: "more",
      prefix: "about/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "Sponsor",
      icon: "like",
      link: "donate.md",
    },
  ],
});
