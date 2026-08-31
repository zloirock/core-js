import { createHash } from 'node:crypto';
import { sortObjectByKey } from '@core-js/compat/helpers';
import { compareVersions } from './target-key.js';

// the name of a built bundle is a hash of everything that decides its bytes. the address it
// becomes is served with `immutable` for a year, so anything that changes the bytes and stays out of
// the hash serves the wrong file for that year, unfixable at the clients that cached it
function toBundleId({ modules, versions, minify }) {
  const hash = createHash('sha256');

  hash.update(`core-js ${ versions.coreJS }\n@core-js/compat ${ versions.compat }\n`);
  hash.update(`@core-js/builder ${ versions.builder }\nminify ${ minify }\n`);
  // sorted where it is hashed, so that the same set is the same bundle whoever built the list
  for (const name of [...modules].sort()) hash.update(`${ name }\n`);

  return hash.digest('hex').slice(0, 16);
}

// the name of the generation: a hash of everything that decides the PLAN, where the bundle name is
// a hash of everything that decides one bundle. a bundle outlives its plan - the page that named
// it is already in a browser - so the two cannot share a name: the generation is what a store keeps
// or drops whole, and one changed module in the scope renames most of the bundles in it
function toGenerationId({ scope, exclude, declaration, versions, minify }) {
  const hash = createHash('sha256');

  hash.update(`core-js ${ versions.coreJS }\n@core-js/compat ${ versions.compat }\n`);
  hash.update(`@core-js/builder ${ versions.builder }\nminify ${ minify }\n`);
  hash.update(`targets ${ canonical(declaration) }\n`);
  for (const name of [...scope].sort()) hash.update(`${ name }\n`);
  // `exclude` decides the plan as much as the scope does, and a pattern can be a RegExp - which
  // `JSON.stringify` renders as `{}`, hashing two different patterns the same
  for (const pattern of [...exclude].map(String).sort()) hash.update(`exclude ${ pattern }\n`);

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
export default function buildBuckets({ targets, listModules, versions, minify, scope, exclude = [] }) {
  const byEngine = new Map();
  const buckets = new Map();

  for (const { engine, version, share } of targets.list) {
    const modules = listModules({ [engine]: version });
    const bundleId = toBundleId({ modules, versions, minify });

    let bucket = buckets.get(bundleId);
    if (!bucket) buckets.set(bundleId, bucket = { bundleId, modules, targets: {}, share: 0 });
    bucket.share += share;

    // the whole target set of the bucket, because the builder decides the downleveling from it.
    // where one engine lands in a bucket twice the LOWEST version wins: taking the last one would
    // let the strongest engine decide, and hand the weakest the syntax it cannot read
    const known = bucket.targets[engine];
    if (known === undefined || compareVersions(version, known) < 0) bucket.targets[engine] = version;

    let entries = byEngine.get(engine);
    if (!entries) byEngine.set(engine, entries = []);
    entries.push({ version, bundleId });
  }

  for (const entries of byEngine.values()) entries.sort((a, b) => compareVersions(a.version, b.version));

  // the baseline comes from the declared range as a whole, never from a threshold: it is what a
  // visitor gets whenever the plan has nothing better
  const baselineModules = listModules(targets.range);

  return {
    generation: toGenerationId({ scope, exclude, declaration: targets.range, versions, minify }),
    baseline: {
      bundleId: toBundleId({ modules: baselineModules, versions, minify }),
      modules: baselineModules,
      targets: targets.range,
    },
    byEngine,
    buckets: buckets.values().toArray(),
  };
}
