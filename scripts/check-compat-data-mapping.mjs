import semver from 'semver';
import mapping from '@core-js/compat/src/mapping.mjs';

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

async function getLatestFromMDN(name, branch) {
  const releases = await getFromMDN(name, branch);
  const version = Object.keys(releases).reduce((a, b) => {
    return releases[b].engine_version && cmp(coerce(b), '>', coerce(a)) ? b : a;
  });
  return { engine: releases[version].engine_version, version };
}

function modernV8ToChrome(string) {
  const version = coerce(string);
  return version.major * 10 + version.minor;
}

function latest(array) {
  return array[array.length - 1];
}

function assert(condition, engine) {
  if (!condition) {
    updated = false;
    echo(chalk.red(`${ chalk.cyan(engine) } mapping should be updated`));
  }
}

const [
  [{ v8 }],
  electron,
  deno,
  oculus,
  opera,
  operaMobile,
  safari,
  ios,
  samsung,
] = await Promise.all([
  getJSON('https://nodejs.org/dist/index.json'),
  getJSON('https://raw.githubusercontent.com/Kilian/electron-to-chromium/master/chromium-versions.js', 17, -1),
  getLatestFromMDN('deno'),
  getLatestFromMDN('oculus'),
  getLatestFromMDN('opera'),
  getLatestFromMDN('opera_android'),
  getFromMDN('safari'),
  getLatestFromMDN('safari_ios'),
  getLatestFromMDN('samsunginternet_android'),
]);

assert(modernV8ToChrome(v8) <= latest(mapping.ChromeToNode)[0], 'NodeJS');
assert(latest(Object.entries(electron))[0] <= latest(mapping.ChromeToElectron)[0], 'Electron');
assert(modernV8ToChrome(deno.engine) <= latest(mapping.ChromeToDeno)[0], 'Deno');
assert(oculus.engine <= latest(mapping.ChromeMobileToQuest)[0], 'Meta Quest');
assert(opera.version === String(mapping.ChromeToOpera(opera.engine)), 'Opera');
assert(operaMobile.engine <= latest(mapping.ChromeMobileToOperaMobile)[0], 'Opera for Mobile');
assert(ios.version === Object.entries(safari).find(([, { engine_version: engine }]) => engine === ios.engine)[0], 'iOS Safari');
assert(samsung.engine <= latest(mapping.ChromeMobileToSamsung)[0], 'Samsung Internet');

if (updated) echo(chalk.green('updates of compat data mapping not required'));
