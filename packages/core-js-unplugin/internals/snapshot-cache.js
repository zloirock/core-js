import { stripQueryHash } from '@core-js/polyfill-provider/helpers';

// pre->post snapshot handoff for `phase: 'pre+post'` (keyed by module id). pre's transformed
// output emits `_ref = ...` free assignments; post lands the matching `var _ref;` via
// `#rehydrate(inherit)`. losing the snapshot between passes leaves refs dangling at runtime,
// so entries stick around until `reset()` on `buildEnd` drains them - pre-only ids leak
// within a single invocation but can't accumulate across builds.
// ids normalize so pre and post match regardless of the form their bundler emits:
// - `?query` / `#hash` stripped (`foo.js` vs `foo.js?v=1`)
// - backslash -> forward (`C:\src\foo.js` <-> `C:/src/foo.js`)
// - Vite scheme prefixes stripped (`file:///abs/foo.js`, `/@fs/abs/foo.js`, `/@id/virtual:foo`
//   all resolve to `/abs/foo.js`); `i` flag tolerates upper-case `FILE://` / `/@FS/`
// - SFC sub-block queries (`?vue&type=script&setup=true`) kept intact so distinct scripts of
//   the same file don't collide on one key
// - collapse `//` -> `/` so a doubled slash on one side still matches the other
// `/@fs` requires trailing `/` OR end-of-input boundary: without it `/@fsfoo/bar.js`
// would get its leading `/@fs` stripped, producing `foo/bar.js` - theoretical virtual
// module collision. `/@id/` already has trailing slash literal in the pattern
const VITE_SCHEME_PREFIX_RE = /^(?:file:\/\/|\/@fs(?=\/|$)|\/@id\/)/i;
const REPEATED_SLASHES_RE = /\/{2,}/g;
// only framework SFC markers count as sub-block identifiers. pairing `type=`/`lang=`/`setup`
// with a framework key (`vue` / `astro` / `svelte`) avoids matching generic `?type=module` or
// `?lang=en` on non-SFC bundlers that would otherwise get a stray `?type=...` tail kept in
// the snapshot key - causing pre/post lookups to miss when the same file is visited under
// slightly different queries in an unrelated transform pipeline
const SFC_QUERY_MARKER_RE = /[&?](?:astro|svelte|vue)(?:[&=?]|$)/;
const QUERY_OR_HASH_RE = /[#?]/;
// Windows verbatim long-path prefix `\\?\C:\...` (and Vite's normalized `//?/C:/...`).
// strip to canonical `C:/...` so SnapshotCache lookups match across path-mangling stages.
// without strip, `\\?\C:\src\App.vue` and `C:/src/App.vue` (same logical file) had
// different keys → snapshot miss between pre and post passes
const WINDOWS_UNC_PREFIX_RE = /^\/\/\?\//;
function normalizePath(path) {
  let p = path.replaceAll('\\', '/').replace(WINDOWS_UNC_PREFIX_RE, '');
  // composite chains like `/@id/file:///abs/foo` carry two schemes back-to-back. one-pass
  // replace would leave `file:///abs/foo` and miss the bare `/abs/foo` snapshot. iterate
  // until a pass produces no change so any nested scheme combination collapses
  let prev;
  do {
    prev = p;
    p = p.replace(VITE_SCHEME_PREFIX_RE, '');
  } while (p !== prev);
  return p.replaceAll(REPEATED_SLASHES_RE, '/');
}
// Vite HMR appends `&t=<timestamp>` (or `?t=` if no other query) to invalidate module
// cache. each HMR re-fire produces a different timestamp, breaking pre→post snapshot
// lookup for the same logical file. strip the timestamp marker so the key stays stable.
// trailing `?`/`&` and `?&` collapse keep the resulting key in canonical query shape -
// `app.vue?t=1` -> `app.vue` (not `app.vue?`); `?t=1&type=script` -> `?type=script`
const HMR_TIMESTAMP_RE = /[&?]t=\d+/;
const stripHMRTimestamp = id => id
  .replace(HMR_TIMESTAMP_RE, '')
  .replace(/\?&/, '?')
  .replace(/[&?]$/, '');

function normalizeKey(id) {
  const cleanId = stripHMRTimestamp(id);
  if (SFC_QUERY_MARKER_RE.test(cleanId)) {
    // preserve the query since it identifies the sub-block; still normalize the path prefix
    const queryStart = cleanId.search(QUERY_OR_HASH_RE);
    const pathPart = queryStart === -1 ? cleanId : cleanId.slice(0, queryStart);
    const tail = queryStart === -1 ? '' : cleanId.slice(queryStart);
    return normalizePath(pathPart) + tail;
  }
  return normalizePath(stripQueryHash(cleanId));
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
      console.warn(`[core-js] pre-pass called twice for ${ id }; latest snapshot wins`);
    }
    this.#snapshots.set(key, entry);
  }

  take(id) {
    const key = normalizeKey(id);
    const entry = this.#snapshots.get(key);
    if (entry) this.#snapshots.delete(key);
    return entry ?? null;
  }

  // per-file invalidation hook for Vite/Rollup `watchChange`. drops a single snapshot
  // when its source file changes - prevents unbounded growth in long-running dev servers
  // where a pre-pass ran but the matching post was skipped (tree-shake, sibling bail).
  // returns true if the entry existed and was removed (callsite can short-circuit further work)
  invalidate(id) {
    return this.#snapshots.delete(normalizeKey(id));
  }

  size() { return this.#snapshots.size; }

  reset() {
    this.#snapshots.clear();
  }
}
