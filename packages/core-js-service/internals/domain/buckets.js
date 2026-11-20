import { createHash } from 'node:crypto';
import { sortObjectByKey } from '@core-js/compat/helpers';
import { compareVersions } from './target.js';

// the name of a built bundle is a hash of everything that decides its bytes. the address it
// becomes is served with `immutable` for a year, so anything that changes the bytes and stays out of
// the hash serves the wrong file for that year, unfixable at the clients that cached it
function toBundleId({ modules, targets }, versions, minify) {
  const hash = createHash('sha256');

  hash.update(`core-js ${ versions.coreJS }\n@core-js/compat ${ versions.compat }\n`);
  hash.update(`@core-js/builder ${ versions.builder }\nminify ${ minify }\n`);
  hash.update(`targets ${ canonical(targets) }\n`);
  // sorted where it is hashed, so that the same set is the same bundle whoever built the list
  for (const name of [...modules].sort()) hash.update(`${ name }\n`);

  return hash.digest('hex').slice(0, 16);
}

// the name of the generation: a hash of everything that decides the PLAN. a bundle outlives its plan -
// the page that named it is already in a browser - so the generation, which the store keeps or drops
// whole, needs a name of its own
function toGenerationId({ scope, exclude, declaration, versions, minify, compression }) {
  const hash = createHash('sha256');

  hash.update(`core-js ${ versions.coreJS }\n@core-js/compat ${ versions.compat }\n`);
  hash.update(`@core-js/builder ${ versions.builder }\nminify ${ minify }\n`);
  // Older stores named bundles by module list alone and must age out as a separate generation.
  hash.update('bundle-id-format 2\n');
  hash.update(`targets ${ canonical(declaration) }\n`);
  for (const name of [...scope].sort()) hash.update(`${ name }\n`);
  // `exclude` decides the plan as much as the scope does, and a pattern can be a RegExp - which
  // `JSON.stringify` renders as `{}`, hashing two different patterns the same
  for (const pattern of [...exclude].map(String).sort()) hash.update(`exclude ${ pattern }\n`);
  // the generation names what is ON DISK, and compression decides which representations are written
  // and how: a level changed and not renamed would leave the old files in place for ever, because
  // the bundle they belong to is already there
  hash.update(`compression ${ canonical(compression) }\n`);

  return hash.digest('hex').slice(0, 16);
}

// the declaration reaches here in every shape compat accepts, and two shapes that mean the same
// thing have to hash the same: the keys of an object are ordered here rather than by whoever wrote it
function canonical(declaration) {
  if (declaration === null || typeof declaration != 'object') return JSON.stringify(declaration ?? null);
  if (Array.isArray(declaration)) return JSON.stringify(declaration);
  return JSON.stringify(sortObjectByKey(declaration));
}

// the plan: engine thresholds collapsed into buckets, in one pass and two projections. two passes
// could drift, and a matcher naming a bundle the warm-up never built means a build on the request
// path
export default function buildBuckets({ targets, listModules, versions, minify, scope, exclude = [], compression = {} }) {
  const byEngine = new Map();
  const buckets = new Map();

  for (const { engine, version, share } of targets.list) {
    const modules = listModules({ [engine]: version });
    const key = JSON.stringify(modules.toSorted());

    let bucket = buckets.get(key);
    if (!bucket) buckets.set(key, bucket = { modules, targets: {}, share: 0 });
    bucket.share += share;

    // the whole target set of the bucket, because the builder decides the downleveling from it.
    // where one engine lands in a bucket twice the LOWEST version wins: taking the last one would
    // let the strongest engine decide, and hand the weakest the syntax it cannot read
    const known = bucket.targets[engine];
    if (known === undefined || compareVersions(version, known) < 0) bucket.targets[engine] = version;

    let entries = byEngine.get(engine);
    if (!entries) byEngine.set(engine, entries = []);
    entries.push({ version, bucket });
  }

  // Only the completed bucket knows every target that the builder will compile for.
  const baseline = { modules: listModules(targets.range), targets: targets.range };
  baseline.bundleId = toBundleId(baseline, versions, minify);

  const baselineKey = JSON.stringify(baseline.modules.toSorted());
  for (const [key, bucket] of buckets) {
    // The baseline already covers every declared engine that needs this same set.
    bucket.bundleId = key === baselineKey ? baseline.bundleId : toBundleId(bucket, versions, minify);
  }
  for (const [engine, entries] of byEngine) {
    entries.sort((a, b) => compareVersions(a.version, b.version));
    byEngine.set(engine, entries.map(({ version, bucket }) => ({ version, bundleId: bucket.bundleId })));
  }

  return {
    generation: toGenerationId({ scope, exclude, declaration: targets.range, versions, minify, compression }),
    baseline,
    byEngine,
    buckets: buckets.values().toArray(),
  };
}
