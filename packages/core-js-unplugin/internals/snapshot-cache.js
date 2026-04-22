import { stripQueryHash } from '@core-js/polyfill-provider/helpers';

// pre->post snapshot handoff for `phase: 'pre+post'` (keyed by module id).
// pre's transformed output carries `_ref = ...` free assignments without a `var _ref;` -
// post lands the declaration via `#rehydrate(inherit)`. losing the snapshot after pre
// has rewritten the source means post can't re-emit imports and refs go dangling at runtime,
// so we never evict: the unplugin wrapper calls `reset()` on `buildEnd` to bound retention.
// ids are normalized (strip ?query / #hash + backslash -> forward slash + strip Vite-style
// scheme prefixes) so a bundler that visits `foo.js` in pre and `foo.js?v=1` in post still
// finds the snapshot; on Windows a bundler that normalizes `C:\src\foo.js` <-> `C:/src/foo.js`
// between passes also matches. Vite dev-server may expose the same file as `file:///abs/foo.js`
// (pre-resolve) and `/@fs/abs/foo.js` (post-resolve via FS prefix) - both strip to `/abs/foo.js`.
// long-running dev-servers accumulate snapshots between rebuilds - buildEnd per invocation
// drains them; pre-only-visited ids in a single invocation still leak until buildEnd fires
const VITE_SCHEME_PREFIX_RE = /^(?:file:\/\/|\/@fs)/;
function normalizeKey(id) {
  return stripQueryHash(id).replaceAll('\\', '/').replace(VITE_SCHEME_PREFIX_RE, '');
}

export default class SnapshotCache {
  #snapshots = new Map();
  #debug;

  constructor({ debug = false } = {}) {
    this.#debug = debug;
  }

  store(id, entry) {
    const key = normalizeKey(id);
    // double-call is legit in dev-servers (Vite --force, HMR re-invalidation) - gate the
    // diagnostic under `debug` so it only fires when the user is actively investigating.
    // last-write-wins is the right semantic for HMR: the latest pre is the one whose source
    // post will see, so its snapshot is the current truth
    if (this.#debug && this.#snapshots.has(key) && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console -- opt-in diagnostic
      console.warn(`[core-js-unplugin] pre-pass called twice for ${ id }; latest snapshot wins`);
    }
    this.#snapshots.set(key, entry);
  }

  take(id) {
    const key = normalizeKey(id);
    const entry = this.#snapshots.get(key);
    if (entry) this.#snapshots.delete(key);
    return entry ?? null;
  }

  // explicit eviction for callers that know an id won't be revisited (e.g. HMR invalidated
  // the module). avoids unbounded accumulation in long-running dev-servers that never hit
  // `reset()` between builds
  evict(id) {
    this.#snapshots.delete(normalizeKey(id));
  }

  size() { return this.#snapshots.size; }

  reset() {
    this.#snapshots.clear();
  }
}
