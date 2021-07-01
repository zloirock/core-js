'use strict';
/* eslint-disable no-console -- output */
const { cyan, green, red } = require('chalk');
const fetch = require('node-fetch');
const semver = require('semver/functions/coerce');
const cmp = require('semver/functions/cmp');
const {
  ChromeToNode,
  // ChromeToDeno,
  ChromeToSamsung,
  ChromeToOperaMobile,
  SafariToIOS,
} = require('core-js-compat/src/mapping');

let updated = true;

async function getJSON(path) {
  const result = await fetch(path);
  return result.json();
}

async function latestMDN(name) {
  const {
    browsers: { [name]: { releases } },
  } = await getJSON(`https://raw.githubusercontent.com/mdn/browser-compat-data/main/browsers/${ name }.json`);
  const version = Object.keys(releases).reduce((a, b) => {
    return releases[b].engine_version && cmp(semver(b), '>', semver(a)) ? b : a;
  });
  return { engine: releases[version].engine_version, version };
}

function modernV8ToChrome(string) {
  const version = semver(string);
  return version.major * 10 + version.minor;
}

function latest(array) {
  return array[array.length - 1];
}

function assert(condition, engine) {
  if (!condition) {
    updated = false;
    console.log(red(`${ cyan(engine) } mapping should be updated`));
  }
}

(async () => {
  const [{ v8 }] = await getJSON('https://nodejs.org/dist/index.json');
  assert(modernV8ToChrome(v8) <= latest(ChromeToNode)[0], 'NodeJS');

  // wait for https://github.com/mdn/browser-compat-data/pull/10753
  // const deno = await latestMDN('deno');
  // assert(modernV8ToChrome(deno.engine) <= latest(ChromeToDeno)[0], 'Opera Mobile');

  const samsung = await latestMDN('samsunginternet_android');
  assert(samsung.engine <= latest(ChromeToSamsung)[0], 'Samsung Internet');

  const operaMobile = await latestMDN('opera_android');
  assert(operaMobile.engine <= latest(ChromeToOperaMobile)[0], 'Opera Mobile');

  const opera = await latestMDN('opera');
  assert(opera.engine - opera.version === 14, 'Opera');

  const ios = await latestMDN('safari_ios');
  assert(cmp(semver(ios.version), '<=', semver(latest(SafariToIOS)[1])), 'iOS Safari');

  if (updated) console.log(green('updates of compat data mapping not required'));
})();
