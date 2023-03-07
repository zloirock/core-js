import { defineClientConfig } from "@vuepress/client";
//@ts-expect-error ts2307
import CompatPage from "./layouts/Compat.vue";

export default defineClientConfig({
  layouts: {
    CompatPage,
  },
});
