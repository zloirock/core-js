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
      text: "Features",
      icon: "object",
      prefix: "features/",
      children: [
        {
          text: "ES Standards",
          prefix: "es-standard/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "ES Proposals",
          prefix: "es-proposal/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "Web Standards",
          prefix: "web-standard/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "Helpers",
          prefix: "helper/",
          children: "structure",
          collapsible: true,
        },
      ],
      collapsible: true,
    },
    {
      text: "Development",
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
