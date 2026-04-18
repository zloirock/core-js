// pre->post snapshot handoff for `phase: 'pre+post'` (keyed by module id).
// `store` deletes-before-set so Map insertion order stays chronological - enables O(1)
// oldest-eviction and early-break sweep. TTL + hard cap bound leaks in dev-servers where
// buildEnd doesn't fire between rebuilds
const TTL_MS = 60 * 1000;
const SWEEP_THRESHOLD = 32;
const MAX_ENTRIES = 128;
const SWEEP_INTERVAL_MS = 30 * 1000;

export default class SnapshotCache {
  #snapshots = new Map();
  #lastSweepAt = 0;
  #debug;

  constructor({ debug = false } = {}) {
    this.#debug = debug;
  }

  #sweepStale() {
    const cutoff = Date.now() - TTL_MS;
    for (const [id, entry] of this.#snapshots) {
      if (entry.addedAt >= cutoff) break; // chronological: rest is fresher
      this.#snapshots.delete(id);
    }
  }

  // piggyback on runTransform; setInterval would keep CLI event loop alive
  maybeSweep() {
    if (!this.#snapshots.size) return;
    const now = Date.now();
    if (now - this.#lastSweepAt < SWEEP_INTERVAL_MS) return;
    this.#lastSweepAt = now;
    this.#sweepStale();
  }

  store(id, entry) {
    if (this.#snapshots.size >= SWEEP_THRESHOLD) this.#sweepStale();
    // double-call is legit in dev-servers (Vite --force, HMR re-invalidation) - gate the
    // diagnostic under `debug` so it only fires when the user is actively investigating
    if (this.#debug && this.#snapshots.has(id) && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console -- opt-in diagnostic
      console.warn(`[core-js-unplugin] pre-pass called twice for ${ id }; latest snapshot wins`);
    }
    // delete-first so same-id re-insert moves to tail (refreshes chronological order)
    // and isn't double-counted against the cap
    this.#snapshots.delete(id);
    if (this.#snapshots.size >= MAX_ENTRIES) {
      this.#snapshots.delete(this.#snapshots.keys().next().value);
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
    this.#lastSweepAt = 0;
  }
}
