// pre->post snapshot handoff for `phase: 'pre+post'` (keyed by module id).
// pre's transformed output carries `_ref = ...` free assignments without a `var _ref;` -
// post lands the declaration via `#rehydrate(inherit)`. losing the snapshot after pre
// has rewritten the source means post can't re-emit imports and refs go dangling at runtime,
// so we never evict: the unplugin wrapper calls `reset()` on `buildEnd` to bound retention.
export default class SnapshotCache {
  #snapshots = new Map();
  #debug;

  constructor({ debug = false } = {}) {
    this.#debug = debug;
  }

  store(id, entry) {
    // double-call is legit in dev-servers (Vite --force, HMR re-invalidation) - gate the
    // diagnostic under `debug` so it only fires when the user is actively investigating
    if (this.#debug && this.#snapshots.has(id) && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console -- opt-in diagnostic
      console.warn(`[core-js-unplugin] pre-pass called twice for ${ id }; latest snapshot wins`);
    }
    this.#snapshots.set(id, entry);
  }

  take(id) {
    const entry = this.#snapshots.get(id);
    if (entry) this.#snapshots.delete(id);
    return entry ?? null;
  }

  reset() {
    this.#snapshots.clear();
  }
}
