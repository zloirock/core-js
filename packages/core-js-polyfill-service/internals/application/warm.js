// how many bundles are built at once. a fixed handful rather than one per core: rolldown and swc
// are multithreaded themselves, so past a few workers there is nothing measurable left to win
const CONCURRENCY = 4;

// the warm-up owns the queue: the order of the work and how much of it runs at once
export default function createWarm(plan, { bundles, build, warn, concurrency = CONCURRENCY }) {
  // the identifier is the hash of the input, so building the same input twice is harmless - which is
  // what makes locks unnecessary
  async function ensureBuilt({ bundleId, modules, targets }) {
    if (await bundles.has(bundleId)) return false;

    // the module list comes from the plan, not from the build: `builder()` returns only
    // `{ script }`, and ours is the one that went into the identifier
    await bundles.put(bundleId, { modules, script: await build({ modules, targets }) });

    return true;
  }

  return {
    // the baseline is first and requests wait for it; everything else warms under traffic, because a
    // miss goes to the baseline. a failure here is a startup failure - there is nothing to fall
    // back to
    async baseline() {
      return ensureBuilt(plan.baseline);
    },

    // most of the traffic sits in a handful of buckets
    async buckets() {
      const queue = plan.buckets.toSorted((a, b) => b.share - a.share);
      const built = [];
      const failed = [];

      async function worker() {
        while (queue.length) {
          const bucket = queue.shift();

          try {
            if (await ensureBuilt(bucket)) built.push(bucket.bundleId);
          } catch (error) {
            // one bucket failing does not stop the warm-up, and is reported per bundle so that
            // a systematic failure is not hidden behind the first one
            failed.push(bucket.bundleId);
            warn(`warm:failed:${ bucket.bundleId }`, `the bundle for ${
              JSON.stringify(bucket.targets) } could not be built (${ error.message })`);
          }
        }
      }

      await Promise.all(Array.from({ length: concurrency }, worker));

      return { built, failed };
    },
  };
}
