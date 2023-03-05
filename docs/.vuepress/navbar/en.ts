import { navbar } from "vuepress-theme-hope";

export const navbarEn = navbar([
  {
    text: "Guide",
    link: "/guide/",
    icon: "creative",
  },
  {
    text: "Features",
    icon: "object",
    prefix: "/features/",
    children: [
      {
        text: "ES Standards",
        link: "es-standard/README.md",
      },
      {
        text: "ES Proposals",
        link: "es-proposal/README.md",
      },
      {
        text: "Web Standards",
        link: "web-standard/README.md",
      },
      {
        text: "Helpers",
        link: "helper/README.md",
      },
    ],
  },
  {
    text: "Contributing",
    link: "/dev/",
    icon: "debug",
  },
  {
    text: "Compatibility",
    link: "/compat.md",
    icon: "form",
  },
  {
    text: "Project",
    icon: "more",
    children: [
      {
        text: "About",
        icon: "info",
        link: "/about/README.md",
      },
      {
        text: "Changelog",
        icon: "time",
        link: "/about/changelog.md",
      },
      {
        text: "Blog",
        link: "/blog/",
        icon: "blog",
      },
    ],
  },
  {
    text: "Sponsor",
    link: "/donate.md",
    icon: "like",
  },
]);
