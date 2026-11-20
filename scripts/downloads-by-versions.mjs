import semver from 'semver';

const { coerce, cmp } = semver;
const { cyan, green } = chalk;
const ALL = !argv._.includes('main-only');
const downloadsByPatch = {};
const downloadsByMinor = {};
const downloadsByMajor = {};
let total = 0;

async function getStat(pkg) {
  const res = await fetch(`https://api.npmjs.org/versions/${ encodeURIComponent(pkg) }/last-week`);
  const { downloads } = await res.json();
  return downloads;
}

const [core, pure, bundle] = await Promise.all([
  getStat('core-js'),
  ALL ? getStat('core-js-pure') : {},
  ALL ? getStat('core-js-bundle') : {},
]);

for (const patch of Object.keys({ ...core, ...pure, ...bundle })) {
  const version = coerce(patch);
  const { major } = version;
  const minor = `${ major }.${ version.minor }`;
  const downloads = (core[patch] ?? 0) + (pure[patch] ?? 0) + (bundle[patch] ?? 0);
  downloadsByPatch[patch] = downloads;
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
