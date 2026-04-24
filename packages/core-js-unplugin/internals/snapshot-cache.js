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
const VITE_SCHEME_PREFIX_RE = /^(?:file:\/\/|\/@fs|\/@id\/)/i;
const REPEATED_SLASHES_RE = /\/{2,}/g;
// only framework SFC markers count as sub-block identifiers. pairing `type=`/`lang=`/`setup`
// with a framework key (`vue` / `astro` / `svelte`) avoids matching generic `?type=module` or
// `?lang=en` on non-SFC bundlers that would otherwise get a stray `?type=...` tail kept in
// the snapshot key - causing pre/post lookups to miss when the same file is visited under
// slightly different queries in an unrelated transform pipeline
const SFC_QUERY_MARKER_RE = /[&?](?:astro|svelte|vue)(?:[&=?]|$)/;
const QUERY_OR_HASH_RE = /[#?]/;
function normalizePath(path) {
  return path
    .replaceAll('\\', '/')
    .replace(VITE_SCHEME_PREFIX_RE, '')
    .replaceAll(REPEATED_SLASHES_RE, '/');
}
function normalizeKey(id) {
  if (SFC_QUERY_MARKER_RE.test(id)) {
    // preserve the query since it identifies the sub-block; still normalize the path prefix
    const queryStart = id.search(QUERY_OR_HASH_RE);
    const pathPart = queryStart === -1 ? id : id.slice(0, queryStart);
    const tail = queryStart === -1 ? '' : id.slice(queryStart);
    return normalizePath(pathPart) + tail;
  }
  return normalizePath(stripQueryHash(id));
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

  size() { return this.#snapshots.size; }

  reset() {
    this.#snapshots.clear();
  }
}
