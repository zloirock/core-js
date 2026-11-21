import semver from 'semver';

const { coerce, cmp } = semver;
const { cyan, green } = chalk;
const packages = argv._.includes('main-only')
  ? ['core-js']
  : ['core-js', 'core-js-pure', 'core-js-bundle', '@core-js/pure', '@core-js/bundle'];
const downloadsByPatch = {};
const downloadsByMinor = {};
const downloadsByMajor = {};
let total = 0;

async function getStat(pkg) {
  const res = await fetch(`https://api.npmjs.org/versions/${ encodeURIComponent(pkg) }/last-week`);
  const { downloads } = await res.json();
  return downloads;
}

for (const stats of await Promise.all(packages.map(getStat))) {
  for (const [patch, downloads] of Object.entries(stats)) {
    downloadsByPatch[patch] = (downloadsByPatch[patch] ?? 0) + downloads;
  }
}

for (const [patch, downloads] of Object.entries(downloadsByPatch)) {
  const version = coerce(patch);
  const { major } = version;
  const minor = `${ major }.${ version.minor }`;
  downloadsByMinor[minor] = (downloadsByMinor[minor] ?? 0) + downloads;
  downloadsByMajor[major] = (downloadsByMajor[major] ?? 0) + downloads;
  total += downloads;
}

function log(kind, map) {
  echo(green(`downloads for 7 days by ${ cyan(kind) } releases:`));
  console.table(Object.fromEntries(Object.entries(map).toSorted(([a], [b]) => {
    return cmp(coerce(a), '>', coerce(b)) ? 1 : -1;
  }).map(([version, downloads]) => [
    version,
    { downloads, '%': `${ (downloads / total * 100).toFixed(2).padStart(5) } %` },
  ])));
}

log('patch', downloadsByPatch);
log('minor', downloadsByMinor);
log('major', downloadsByMajor);
