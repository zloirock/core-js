import coerce from 'semver/functions/coerce.js';

async function getStat(pkg) {
  const res = await fetch(`https://www.npmjs.com/package/${ pkg }`);
  const html = await res.text();
  const [, json] = html.match(/>window\.__context__ = ([^<]+)<\//);
  return JSON.parse(json).context.versionsDownloads;
}

const { cyan, green } = chalk;
const ALL = !argv['main-only'];
const core = await getStat('core-js');
const pure = ALL && await getStat('core-js-pure');
const bundle = ALL && await getStat('core-js-bundle');
const downloadsByPatch = {};
const downloadsByMinor = {};
const downloadsByMajor = {};
let total = 0;

for (let [patch, downloads] of Object.entries(core)) {
  const semver = coerce(patch);
  const { major } = semver;
  const minor = `${ major }.${ semver.minor }`;
  if (ALL) downloads += (pure[patch] || 0) + (bundle[patch] || 0);
  downloadsByPatch[patch] = downloads;
  downloadsByMinor[minor] = (downloadsByMinor[minor] || 0) + downloads;
  downloadsByMajor[major] = (downloadsByMajor[major] || 0) + downloads;
  total += downloads;
}

function log(kind, map) {
  echo(green(`downloads for 7 days by ${ cyan(kind) } releases:`));
  console.table(Object.keys(map).sort().reduce((memo, version) => {
    const downloads = map[version];
    memo[version] = { downloads, '%': `${ (downloads / total * 100).toFixed(2).padStart(5) } %` };
    return memo;
  }, {}));
}

log('patch', downloadsByPatch);
log('minor', downloadsByMinor);
log('major', downloadsByMajor);
