'use strict';
/* eslint-disable no-console -- output */
const fetch = require('node-fetch');
const coerce = require('semver/functions/coerce');

(async () => {
  const res = await fetch('https://www.npmjs.com/package/core-js');
  const html = await res.text();
  const [, json] = html.match(/>window\.__context__ = ([^<]+)<\//);
  const context = JSON.parse(json);
  const downloadsByPatch = context.context.versionsDownloads;
  const downloadsByMinor = {};
  const downloadsByMajor = {};
  let total = 0;

  for (const [version, downloads] of Object.entries(downloadsByPatch)) {
    const semver = coerce(version);
    const { major } = semver;
    const minor = `${ major }.${ semver.minor }`;
    downloadsByMinor[minor] = (downloadsByMinor[minor] || 0) + downloads;
    downloadsByMajor[major] = (downloadsByMajor[major] || 0) + downloads;
    total += downloads;
  }

  function log(kind, map) {
    console.log(`\u001B[32mdownloads for 7 days by ${ kind } releases:\u001B[0m`);
    console.table(Object.keys(map).sort().reduce((memo, version) => {
      const downloads = map[version];
      memo[version] = { downloads, '%': `${ (downloads / total * 100).toFixed(2).padStart(5) } %` };
      return memo;
    }, {}));
  }

  log('patch', downloadsByPatch);
  log('minor', downloadsByMinor);
  log('major', downloadsByMajor);
})();
