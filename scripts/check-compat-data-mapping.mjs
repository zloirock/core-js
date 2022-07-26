import semver from 'semver';
import mapping from 'core-js-compat/src/mapping.mjs';

const { coerce, cmp } = semver;
let updated = true;

async function getJSON(path, ...slice) {
  const result = await fetch(path);
  const text = await result.text();
  return JSON.parse(text.slice(...slice));
}

async function latestMDN(name, branch = 'mdn/browser-compat-data/main') {
  const {
    browsers: { [name]: { releases } },
  } = await getJSON(`https://raw.githubusercontent.com/${ branch }/browsers/${ name }.json`);
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
  ios,
  samsung,
] = await Promise.all([
  getJSON('https://nodejs.org/dist/index.json'),
  getJSON('https://raw.githubusercontent.com/Kilian/electron-to-chromium/master/chromium-versions.js', 17, -1),
  latestMDN('deno'),
  latestMDN('oculus'),
  latestMDN('opera'),
  latestMDN('opera_android'),
  latestMDN('safari_ios'),
  latestMDN('samsunginternet_android'),
]);

assert(modernV8ToChrome(v8) <= latest(mapping.ChromeToNode)[0], 'NodeJS');
assert(latest(Object.entries(electron))[0] <= latest(mapping.ChromeToElectron)[0], 'Electron');
assert(modernV8ToChrome(deno.engine) <= latest(mapping.ChromeToDeno)[0], 'Deno');
assert(oculus.engine <= latest(mapping.AndroidToOculus)[0], 'Oculus');
assert(opera.engine - opera.version === 14, 'Opera');
assert(operaMobile.engine <= latest(mapping.ChromeToOperaMobile)[0], 'Opera Mobile');
assert(cmp(coerce(ios.version), '<=', coerce(latest(mapping.SafariToIOS)[1])), 'iOS Safari');
assert(samsung.engine <= latest(mapping.ChromeToSamsung)[0], 'Samsung Internet');

if (updated) echo(chalk.green('updates of compat data mapping not required'));
