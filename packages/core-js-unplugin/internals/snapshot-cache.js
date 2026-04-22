import { stripQueryHash } from '@core-js/polyfill-provider/helpers';

// pre->post snapshot handoff for `phase: 'pre+post'` (keyed by module id).
// pre's transformed output carries `_ref = ...` free assignments without a `var _ref;` -
// post lands the declaration via `#rehydrate(inherit)`. losing the snapshot after pre
// has rewritten the source means post can't re-emit imports and refs go dangling at runtime,
// so we never evict: the unplugin wrapper calls `reset()` on `buildEnd` to bound retention.
// ids are normalized (strip ?query / #hash + backslash -> forward slash) so a bundler that
// visits `foo.js` in pre and `foo.js?v=1` in post still finds the snapshot; on Windows a
// bundler that normalizes `C:\src\foo.js` <-> `C:/src/foo.js` between passes also matches
function normalizeKey(id) {
  return stripQueryHash(id).replaceAll('\\', '/');
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

  reset() {
    this.#snapshots.clear();
  }
}
