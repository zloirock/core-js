<script lang="ts" setup>
//@ts-expect-error it is an alias
import CommonWrapper from "@theme-hope/components/CommonWrapper";
//@ts-expect-error it is an alias
import NormalPage from "@theme-hope/components/NormalPage";
import { onMounted, ref } from "vue";
import _compatData from "core-js-compat/data.json";

const compatData = ref(_compatData);
const environments = [
  "your-browser",
  "android",
  "bun",
  "chrome",
  "chrome-android",
  "deno",
  "edge",
  "electron",
  "firefox",
  "firefox-android",
  "hermes",
  "ie",
  "ios",
  "node",
  "opera",
  "opera-android",
  "phantom",
  "quest",
  "react-native",
  "rhino",
  "safari",
  "samsung",
] as const;

function calcValue(
  env: (typeof environments)[number],
  value: boolean | string | undefined
) {
  switch (value) {
    case true:
      return env === "your-browser" ? "not required" : "support";
    case false:
      return env === "your-browser" ? "required" : "no";
    case undefined:
      return env === "your-browser" ? "testing" : "no";
    default:
      return value;
  }
}

function calcClass(
  env: (typeof environments)[number],
  value: boolean | string | undefined
) {
  switch (value) {
    case "no available test":
      return "nodata";
    case undefined:
      return env === "your-browser" ? "testing" : "false";
    default:
      return (!!value).toString();
  }
}

onMounted(async () => {
  //@ts-expect-error ts2307
  await import("@compat-tests");
  for (const [moduleName, moduleData] of Object.entries(compatData.value)) {
    try {
      const test = (
        (window as any).tests as Record<
          Partial<(typeof environments)[number]>,
          Function | Array<Function>
        >
      )[moduleName];
      if (!test) moduleData["your-browser"] = "no available test";
      else if (test instanceof Array)
        moduleData["your-browser"] = test.reduce(
          (value, testFunc) => value && !!testFunc(),
          true
        );
      else moduleData["your-browser"] = !!test();
    } catch {
      moduleData["your-browser"] = false;
    }
  }
});
</script>

<template>
  <CommonWrapper>
    <NormalPage>
      <template #contentAfter>
        <table class="theme-hope-content compat" id="table">
          <tr>
            <th>module</th>
            <th
              v-for="env in environments"
              v-html="env.replace(/-/g, '<br />')"
              :key="env"
            ></th>
          </tr>
          <tr v-for="(moduleData, moduleName) in compatData" :key="moduleName">
            <td>
              <a
                :href="`https://github.com/zloirock/core-js/blob/master/tests/compat/tests.js#:~:text='${moduleName.replace(
                  /-/g,
                  '%2D'
                )}'`"
                target="_blank"
                >{{ moduleName }}</a
              >
            </td>
            <template v-for="env in environments" :key="env">
              <td :class="calcClass(env, moduleData[env])">
                {{ calcValue(env, moduleData[env]) }}
              </td>
            </template>
          </tr>
        </table>
      </template>
    </NormalPage>
  </CommonWrapper>
</template>

<style lang="scss">
.page-reading-time-info {
  display: none;
}

.nodata {
  color: grey;
}

.testing {
  color: #eecc11;
}

.true {
  color: #00882c;
}

.false {
  color: #e11;
}
</style>
