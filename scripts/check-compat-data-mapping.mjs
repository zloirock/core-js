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
    console.log(chalk.red(`${ chalk.cyan(engine) } mapping should be updated`));
  }
}

const [{ v8 }] = await getJSON('https://nodejs.org/dist/index.json');
assert(modernV8ToChrome(v8) <= latest(mapping.ChromeToNode)[0], 'NodeJS');

const deno = await latestMDN('deno');
assert(modernV8ToChrome(deno.engine) <= latest(mapping.ChromeToDeno)[0], 'Deno');

const electron = await getJSON('https://raw.githubusercontent.com/Kilian/electron-to-chromium/master/chromium-versions.js', 17, -1);
assert(latest(Object.entries(electron))[0] <= latest(mapping.ChromeToElectron)[0], 'Electron');

const samsung = await latestMDN('samsunginternet_android');
assert(samsung.engine <= latest(mapping.ChromeToSamsung)[0], 'Samsung Internet');

const operaMobile = await latestMDN('opera_android');
assert(operaMobile.engine <= latest(mapping.ChromeToOperaMobile)[0], 'Opera Mobile');

const opera = await latestMDN('opera');
assert(opera.engine - opera.version === 14, 'Opera');

const ios = await latestMDN('safari_ios');
assert(cmp(coerce(ios.version), '<=', coerce(latest(mapping.SafariToIOS)[1])), 'iOS Safari');

if (updated) console.log(chalk.green('updates of compat data mapping not required'));
