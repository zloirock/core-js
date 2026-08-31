import { availableParallelism } from 'node:os';

// our preference when the client's q values tie
export const ENCODING_PREFERENCE = ['br', 'gzip', 'identity'];

// which representations of a bundle are stored. brotli is off by default: over the whole es. scope
// it is 12% smaller than gzip and costs about as much again as building the bundle, so turning it
// on roughly doubles the warm-up - every bundle of the plan pays it
export const COMPRESSION = { identity: true, gzip: true };

// how many bundles are built at once: half of what this process may use, and never less than one,
// since no workers at all is a queue that never drains. `availableParallelism` rather than
// `cpus().length` - it follows the CPU set the process is ALLOWED to use, so a container pinned to
// two cores of a large host starts one builder rather than half the host. Halved because rolldown
// and swc are multithreaded of their own
export function concurrencyFor(cores) {
  return Math.max(1, cores >> 1);
}

export const CONCURRENCY = concurrencyFor(availableParallelism());

// how many generations of bundles stay on disk beside the one being served. one covers both cases
// that matter: the page of the deploy just replaced is already in a browser and will ask for its
// bundle in a moment, and a rollback finds its bundles where it left them
export const RETAIN = 1;

// how much of a header written by the CLIENT is read at all. past the bound it is not read AT
// ALL, never truncated: a cut `;q=0` or a cut `Version/` changes what the header says rather than
// shortening it
export const HEADER_LIMIT = 1024;
