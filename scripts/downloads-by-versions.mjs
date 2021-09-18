import coerce from 'semver/functions/coerce.js';

async function getStat(pkg) {
  const res = await fetch(`https://www.npmjs.com/package/${ pkg }`);
  const html = await res.text();
  const [, json] = html.match(/>window\.__context__ = ([^<]+)<\//);
  return JSON.parse(json).context.versionsDownloads;
}

const { cyan, green } = chalk;
const PURE = !argv['main-only'];
const core = await getStat('core-js');
const pure = PURE && await getStat('core-js-pure');
const downloadsByPatch = {};
const downloadsByMinor = {};
const downloadsByMajor = {};
let total = 0;

for (const [patch, downloadsMain] of Object.entries(core)) {
  const downloadsPure = PURE && pure[patch] || 0;
  const semver = coerce(patch);
  const { major } = semver;
  const minor = `${ major }.${ semver.minor }`;
  downloadsByPatch[patch] = downloadsMain + downloadsPure;
  downloadsByMinor[minor] = (downloadsByMinor[minor] || 0) + downloadsMain + downloadsPure;
  downloadsByMajor[major] = (downloadsByMajor[major] || 0) + downloadsMain + downloadsPure;
  total += downloadsMain + downloadsPure;
}

function log(kind, map) {
  console.log(green(`downloads for 7 days by ${ cyan(kind) } releases:`));
  console.table(Object.keys(map).sort().reduce((memo, version) => {
    const downloads = map[version];
    memo[version] = { downloads, '%': `${ (downloads / total * 100).toFixed(2).padStart(5) } %` };
    return memo;
  }, {}));
}

log('patch', downloadsByPatch);
log('minor', downloadsByMinor);
log('major', downloadsByMajor);
