import semver from 'semver';
import mapping from '../packages/core-js-compat/src/mapping.mjs';

const { coerce, cmp } = semver;
let updated = true;

async function getJSON(path, ...slice) {
  const result = await fetch(path);
  const text = await result.text();
  return JSON.parse(text.slice(...slice));
}

async function getFromMDN(name, branch = 'mdn/browser-compat-data/main') {
  const {
    browsers: { [name]: { releases } },
  } = await getJSON(`https://raw.githubusercontent.com/${ branch }/browsers/${ name }.json`);
  return releases;
}

function getLatest(releases) {
  const version = Object.keys(releases).reduce((a, b) => {
    return releases[b].engine_version && cmp(coerce(b), '>', coerce(a)) ? b : a;
  });
  return { engine: releases[version].engine_version, version };
}

async function getLatestFromMDN(name, branch) {
  return getLatest(await getFromMDN(name, branch));
}

async function getLatestFromBaselineBrowserMapping(name) {
  const {
    [name]: releases,
  } = await getJSON('https://web-platform-dx.github.io/baseline-browser-mapping/with_downstream/all_versions_object.json');
  return getLatest(releases);
}

function modernV8ToChrome(string) {
  const version = coerce(string);
  return version.major * 10 + version.minor;
}

function latest(array) {
  return array.at(-1);
}

function assert(condition, engine) {
  if (!condition) {
    updated = false;
    echo(chalk.red(`${ chalk.cyan(engine) } mapping should be updated`));
  }
}

const [
  node,
  electron,
  deno,
  oculus,
  opera,
  operaAndroid,
  safari,
  ios,
  samsung,
  yandexAndroid,
] = await Promise.all([
  getJSON('https://nodejs.org/dist/index.json'),
  getJSON('https://raw.githubusercontent.com/Kilian/electron-to-chromium/main/chromium-versions.js', 17, -1),
  getLatestFromMDN('deno'),
  getLatestFromMDN('oculus'),
  getLatestFromMDN('opera'),
  getLatestFromMDN('opera_android'),
  getFromMDN('safari'),
  getLatestFromMDN('safari_ios'),
  getLatestFromMDN('samsunginternet_android'),
  getLatestFromBaselineBrowserMapping('ya_android'),
]);

assert(modernV8ToChrome(node.find(({ v8 }) => v8).v8) <= latest(mapping.ChromeToNode)[0], 'NodeJS');
assert(latest(Object.entries(electron))[0] <= latest(mapping.ChromeToElectron)[0], 'Electron');
assert(modernV8ToChrome(deno.engine) <= latest(mapping.ChromeToDeno)[0], 'Deno');
// Quest Browser after 42 follows the Chromium version, so the build derives it without the mapping
assert(oculus.engine <= latest(mapping.ChromeAndroidToQuest)[0] || coerce(oculus.version).major === Number(oculus.engine), 'Meta Quest');
assert(opera.version === String(mapping.ChromeToOpera(opera.engine)), 'Opera');
assert(operaAndroid.engine <= latest(mapping.ChromeAndroidToOperaAndroid)[0], 'Opera for Android');
assert(ios.version === Object.entries(safari).find(([, { engine_version: engine }]) => engine === ios.engine)[0], 'iOS Safari');
assert(samsung.engine <= latest(mapping.ChromeAndroidToSamsung)[0], 'Samsung Internet');
assert(yandexAndroid.engine <= latest(mapping.ChromeAndroidToYandexAndroid)[0], 'Yandex Browser for Android');

if (updated) echo(chalk.green('updates of compat data mapping not required'));
