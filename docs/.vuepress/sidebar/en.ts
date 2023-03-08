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
          text: "Overview",
          icon: "info",
          link: "README.md",
        },
        {
          text: "Missing Polyfills",
          icon: "notice",
          link: "missing-polyfills.md",
        },
        {
          text: "ES Standards",
          icon: "javascript",
          prefix: "es-standard/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "ES Proposals",
          icon: "proposal",
          prefix: "es-proposal/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "Web Standards",
          icon: "link",
          prefix: "web-standard/",
          children: "structure",
          collapsible: true,
        },
        {
          text: "Helpers",
          icon: "function",
          prefix: "helper/",
          children: "structure",
          collapsible: true,
        },
      ],
      collapsible: true,
    },
    {
      text: "Contribution",
      icon: "tree",
      prefix: "dev/",
      children: "structure",
      collapsible: true,
    },
    {
      text: "Project",
      icon: "more",
      prefix: "project/",
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
