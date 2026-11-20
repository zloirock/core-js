// an identifier to the bytes stored under it, so that `serve` does not reach into the store past
// the application layer
export default function createGetBundle(plan, getRepresentations) {
  const planned = new Set([plan.baseline.bundleId, ...plan.buckets.map(bucket => bucket.bundleId)]);

  return async function getBundle(bundleId) {
    const currentOnly = planned.has(bundleId);
    const representations = await getRepresentations(bundleId, currentOnly);
    if (representations !== null) return { state: 'ready', representations };
    return { state: currentOnly ? 'cold' : 'unknown' };
  };
}
