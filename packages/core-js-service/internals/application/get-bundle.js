// an identifier to the bytes stored under it, so that `serve` does not reach into the store past
// the application layer
export default function createGetBundle(plan, { bundles }) {
  const planned = new Set([plan.baseline.bundleId, ...plan.buckets.map(bucket => bucket.bundleId)]);

  return async function getBundle(bundleId, encoding) {
    // an identifier THIS plan names is answered from THIS generation and no other: the name covers
    // the module list, never the targets it was built for, so the same one in a retained generation
    // can carry another plan's syntax level - modern syntax handed to the engine we routed here
    const ours = !planned.has(bundleId) || await bundles.has(bundleId);
    const bytes = ours ? await bundles.get(bundleId, encoding) : null;

    // an identifier this plan does NOT name is served from whatever generation still holds it: the
    // page that named it is already in a browser, its script is parser-blocking, and a 404 costs
    // that visitor the polyfills and says nothing. how long that lasts is `retain`, not this branch
    if (bytes !== null) return { state: 'ready', bytes };

    // and the two misses stay apart: a bucket of this plan is only cold, which `serve` answers
    // with a redirect to the baseline, while anything else is unknown and gets 404. neither costs
    // more than a lookup in memory
    return planned.has(bundleId) ? { state: 'cold' } : { state: 'unknown' };
  };
}
