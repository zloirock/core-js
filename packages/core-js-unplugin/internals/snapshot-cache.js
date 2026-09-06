import { WINDOWS_UNC_PREFIX_RE } from '@core-js/polyfill-provider/helpers/path-normalize';
import { parseModuleId } from './sfc-shapes.js';

// pre->post snapshot handoff for `phase: 'pre+post'`, keyed by the ENVIRONMENT plus the whole
// module id (see `normalizeKey`). pre's transformed
// output emits `_ref = ...` free assignments; post lands the matching `var _ref;` via
// `#rehydrate(inherit)`. losing the snapshot between passes leaves refs dangling at runtime,
// so entries stick around until `reset()` on `buildEnd` drains them - pre-only ids leak
// within a single invocation but can't accumulate across builds.
// the id's PATH normalizes so pre and post match regardless of the form their bundler emits:
// - backslash -> forward (`C:\src\foo.js` <-> `C:/src/foo.js`)
// - Vite scheme prefixes stripped (`file:///abs/foo.js`, `/@fs/abs/foo.js`, `/@id/virtual:foo`
//   all resolve to `/abs/foo.js`); `i` flag tolerates upper-case `FILE://` / `/@FS/`
// - collapse `//` -> `/` so a doubled slash on one side still matches the other
// Its query and fragment are NOT normalized away - they are identity, see `normalizeKey`
// `/@fs` requires trailing `/` OR end-of-input boundary: without it `/@fsfoo/bar.js`
// would get its leading `/@fs` stripped, producing `foo/bar.js` - theoretical virtual
// module collision. `/@id/` already has trailing slash literal in the pattern.
// `file://` accepts optional `localhost` host segment per RFC 3986 - some bundlers /
// Node URL helpers serialize file URLs as `file://localhost/abs/path` instead of the
// canonical `file:///abs/path` triple-slash form. `(?=\/)` lookahead pins the optional
// host to localhost only: `file://otherhost/path` doesn't match `localhost`, doesn't
// follow with `/` after the empty optional group either, so the regex passes through
const VITE_SCHEME_PREFIX_RE = /^(?:file:\/\/(?:localhost)?(?=\/)|\/@fs(?=\/|$)|\/@id\/)/i;
const REPEATED_SLASHES_RE = /\/{2,}/g;
// `WINDOWS_UNC_PREFIX_RE` (shared) matches `//?/` long-path AND `//./` device-path forms.
// strip to canonical `C:/...` so SnapshotCache lookups align across path-mangling stages
// (`\\?\C:\src\App.vue` vs `C:/src/App.vue` - same logical file produces same key).
// Windows drive letter case asymmetry: some bundler stages lowercase (`c:/src/...`), others
// preserve source case (`C:/src/...`). same logical file produces different keys without
// canonicalisation - lowercase the drive letter so pre / post align under any pipeline mix.
// optional leading `/` matches Vite-style residual after `/@fs/` strip (`/@fs/C:/src/foo.js`
// -> `/C:/src/foo.js`) and `file:///` (`file:///C:/src/foo.js` -> `/C:/src/foo.js`); without
// it those forms keep the slash and the drive letter never lowercases - same logical file,
// different cache keys, snapshot lost between pre / post on Windows + Vite dev-server.
// case-insensitive (`i`, not a bare `[A-Z]` class): an already-lowercase drive behind a scheme
// prefix (`/@fs/c:/...`) must ALSO shed its residual leading `/`, else its key `/c:/...`
// diverges from bare `c:/...`
const WINDOWS_DRIVE_LETTER_RE = /^\/?(?<letter>[a-z]):\//i;
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
  p = p.replaceAll(REPEATED_SLASHES_RE, '/');
  return p.replace(WINDOWS_DRIVE_LETTER_RE, (_, letter) => `${ letter.toLowerCase() }:/`);
}
// Vite's HMR timestamp (`?t=<ms>` / `&t=<ms>`) is the one query parameter that is NOISE: it changes
// on every re-fire of the same logical module, and a re-fire whose post never ran must be
// overwritten by the next pre rather than accumulate. `parseModuleId` already decodes and
// lowercases, so the marker is a TOKEN here rather than a string scan - which is why this file needs
// no id parser of its own. only a NUMERIC value is the marker; `?t=abc` is somebody's own param.
// EVERYTHING ELSE IS IDENTITY, a parameter nothing here recognises included: a MISSED snapshot
// degrades to the supported standalone-`post` path, while a WRONG one silently rewrites another
// module's mutation census, import registry and ref set into this one
const HMR_TIMESTAMP_VALUE_RE = /^\d+(?:\.\d+)?$/;

// `\0` separates the environment from the module part, and can occur in neither: `index.js` refuses
// any id containing one outright, as the virtual-module marker it is
const ENVIRONMENT_SEPARATOR = '\0';

// build the cache key from the SAME structured parse the SFC DETECTION uses (`parseModuleId`), so the
// key can never drift from detection. the query is IDENTITY for every id, not only an SFC sub-block:
// Vite runs its pipeline over `/dep.js` and `/dep.js?v=<hash>` as two modules and interleaves them, so
// a key that dropped the query handed one module's snapshot to the other. param order is
// bundler-dependent (vite vs farm vs custom), so sort the decoded tokens; the hash is appended VERBATIM
// (never sorted - an in-hash `?b=1&a=2` is opaque fragment text). the ENVIRONMENT leads the key because
// one plugin instance serves several of them (Vite's client and ssr passes over one file), each with a
// pipeline of its own
function normalizeKey(id, environment = '') {
  const { path, params, hash } = parseModuleId(id);
  const ownTimestamps = params.getAll('t').filter(value => !HMR_TIMESTAMP_VALUE_RE.test(value));
  params.delete('t');
  for (const value of ownTimestamps) params.append('t', value);
  // re-encode each decoded key/value before the `&`/`=` join: a decoded `&` or `=` inside a value
  // (`a=x%26y` -> value `x&y`) would otherwise re-parse as extra tokens, colliding distinct param sets
  // on one key. re-encoding also folds `+`/`%20` (both decode to space) onto one canonical spelling
  const tokens = [...params].map(([key, value]) => value === ''
    ? encodeURIComponent(key)
    : `${ encodeURIComponent(key) }=${ encodeURIComponent(value) }`).sort();
  const query = tokens.length ? `?${ tokens.join('&') }` : '';
  return `${ environment }${ ENVIRONMENT_SEPARATOR }${ normalizePath(path) }${ query }${ hash }`;
}

export default class SnapshotCache {
  #snapshots = new Map();
  #debug;

  constructor({ debug = false } = {}) {
    this.#debug = debug;
  }

  store(id, entry, environment) {
    const key = normalizeKey(id, environment);
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

  take(id, environment) {
    const key = normalizeKey(id, environment);
    const entry = this.#snapshots.get(key);
    if (entry) this.#snapshots.delete(key);
    return entry ?? null;
  }

  // non-destructive lookup: returns what pre left, leaving the entry in place. used by callers
  // that need to inspect the file before deciding whether to commit to the snapshot - the
  // disable-directive scan reads a `core-js-disable-file` a sibling plugin injected between the
  // passes. on the commit path, callers follow up with `take(id)` to drop the entry; on bail paths
  // the snapshot survives so a subsequent retry can still consume it.
  // pre's TREE is deliberately not among what is carried: emission mutates it in place, so the
  // only tree post could inherit is one that no longer matches the source it is handed, and post
  // re-parses its own input instead
  peek(id, environment) {
    const stored = this.#snapshots.get(normalizeKey(id, environment));
    return {
      snapshot: stored?.snapshot ?? null,
      // whether pre rewrote the source (emitted a content map); gates post's sourcesContent chaining
      preRewroteSource: !!stored?.preRewroteSource,
      // pre's mutation set (semantic global/static slot keys): sibling text mutation is exactly
      // when post's own recompute can no longer re-derive the mutation receivers
      mutatedStatics: stored?.mutatedStatics ?? null,
    };
  }

  // per-file invalidation hook for Vite/Rollup `watchChange`. bounds growth in long-running dev
  // servers where a pre-pass ran but the matching post was skipped (tree-shake, sibling bail);
  // without it an edited SFC would leave its script / template / style snapshots stale for good
  // (the cache has no size cap). returns true when any entry was removed
  invalidate(id) {
    // `watchChange` reports the FILE, with no query, no fragment and no environment - so the sweep
    // is by path across every key that carries it: the sub-blocks a framework plugin split it into,
    // the query-suffixed copies a dev server requests beside the bare one, and every environment
    const base = normalizePath(parseModuleId(id).path);
    let removed = false;
    for (const key of this.#snapshots.keys()) {
      const module = key.slice(key.indexOf(ENVIRONMENT_SEPARATOR) + 1);
      // `?` and `#` are the only sub-key boundaries - `normalizePath` leaves neither in a path
      if (module === base || module.startsWith(`${ base }?`) || module.startsWith(`${ base }#`)) {
        this.#snapshots.delete(key);
        removed = true;
      }
    }
    return removed;
  }

  size() { return this.#snapshots.size; }

  reset() {
    this.#snapshots.clear();
  }
}
