import {
  stripQueryHash,
  WINDOWS_UNC_PREFIX_RE,
} from '@core-js/polyfill-provider/helpers/path-normalize';

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
// module collision. `/@id/` already has trailing slash literal in the pattern.
// `file://` accepts optional `localhost` host segment per RFC 3986 - some bundlers /
// Node URL helpers serialize file URLs as `file://localhost/abs/path` instead of the
// canonical `file:///abs/path` triple-slash form
const VITE_SCHEME_PREFIX_RE = /^(?:file:\/\/(?:localhost)?|\/@fs(?=\/|$)|\/@id\/)/i;
const REPEATED_SLASHES_RE = /\/{2,}/g;
// only framework SFC markers count as sub-block identifiers. pairing `type=`/`lang=`/`setup`
// with a framework key (`vue` / `astro` / `svelte`) avoids matching generic `?type=module` or
// `?lang=en` on non-SFC bundlers that would otherwise get a stray `?type=...` tail kept in
// the snapshot key - causing pre/post lookups to miss when the same file is visited under
// slightly different queries in an unrelated transform pipeline
const SFC_QUERY_MARKER_RE = /[&?](?:astro|svelte|vue)(?:[&=?]|$)/;
const QUERY_OR_HASH_RE = /[#?]/;
// `WINDOWS_UNC_PREFIX_RE` (shared) matches `//?/` long-path AND `//./` device-path forms.
// strip to canonical `C:/...` so SnapshotCache lookups align across path-mangling stages
// (`\\?\C:\src\App.vue` vs `C:/src/App.vue` - same logical file produces same key).
// Windows drive letter case asymmetry: some bundler stages lowercase (`c:/src/...`), others
// preserve source case (`C:/src/...`). same logical file produces different keys without
// canonicalisation - lowercase the drive letter so pre / post align under any pipeline mix
const WINDOWS_DRIVE_LETTER_RE = /^(?<letter>[A-Z]):\//;
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
// Vite HMR appends `&t=<timestamp>` (or `?t=` if no other query) to invalidate module
// cache. each HMR re-fire produces a different timestamp, breaking pre->post snapshot
// lookup for the same logical file. strip the timestamp marker so the key stays stable.
// `g` flag handles legitimate multi-marker shapes (`?t=1&t=2` from re-fire wrapping a
// previous wrapper). post-strip cleanup keeps the resulting key in canonical query shape:
// `?t=1&type=script` -> `?type=script`, `?t=1` -> `''`, `?t=1&import` -> `?import`.
// optional `(?:\.\d+)?` accepts decimal timestamps (some bundlers emit `?t=1234.5`); the
// `(?=[&#]|$)` boundary anchors the match so `?t=1.5/foo` doesn't truncate path text -
// without it `\d+` alone would consume only `1`, leaving `.5` as garbage in the key
const HMR_TIMESTAMP_RE = /[&?]t=\d+(?:\.\d+)?(?=[#&]|$)/g;
// when the FIRST `?t=` was stripped a leading `&` may now sit where `?` belonged - swap.
// gate on positional check: only apply when ORIGINAL id had `?t=` at the first `?`/`#`
// boundary AND the post-strip char at the same offset is `&`. without the position gate,
// paths containing literal `&` (e.g. `/dir&with/file.js?t=1` -> `/dir&with/file.js`) get
// their first `&` mistakenly rewritten to `?`, producing wrong-key snapshot lookups
function stripHMRTimestamp(id) {
  if (!HMR_TIMESTAMP_RE.test(id)) return id;
  HMR_TIMESTAMP_RE.lastIndex = 0;
  let stripped = id.replaceAll(HMR_TIMESTAMP_RE, '');
  // restore `?` only when HMR token was the FIRST query separator and another `&`-prefixed
  // token follows. positional check via `id.indexOf('?t=')` matches the `?t=` form
  // exclusively (not `&t=` mid-query) - the latter strip leaves earlier `?` intact, no swap needed
  const firstQuery = id.search(/[#?]/);
  if (firstQuery !== -1 && id.startsWith('?t=', firstQuery) && stripped[firstQuery] === '&') {
    stripped = `${ stripped.slice(0, firstQuery) }?${ stripped.slice(firstQuery + 1) }`;
  }
  return stripped
    .replace(/\?&/, '?')
    .replace(/[&?]$/, '');
}

function normalizeKey(id) {
  const cleanId = stripHMRTimestamp(id);
  if (SFC_QUERY_MARKER_RE.test(cleanId)) {
    // strip Windows UNC verbatim prefix (`\\?\C:\...` / `//?/C:/...`) BEFORE the SFC split,
    // otherwise `cleanId.search(/[#?]/)` matches the embedded `?` of the UNC prefix at index
    // 2 instead of the SFC `?vue&type=...` boundary. without this, pre-on-Windows-UNC and
    // post-on-canonical-form keys diverge, snapshot miss for the same logical SFC sub-block
    const uncStripped = cleanId.replaceAll('\\', '/').replace(WINDOWS_UNC_PREFIX_RE, '');
    // preserve the query since it identifies the sub-block; still normalize the path prefix
    const queryStart = uncStripped.search(QUERY_OR_HASH_RE);
    const pathPart = queryStart === -1 ? uncStripped : uncStripped.slice(0, queryStart);
    const tail = queryStart === -1 ? '' : uncStripped.slice(queryStart);
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

  // post-pass entry: take + decide whether pre's cached parse can be reused. parse reuse
  // requires `postInput` byte-equality with current code - sibling plugins may have
  // mutated text between passes, and only matching bytes guarantee AST position fidelity.
  // returns `{ snapshot, ast, comments }` with ast/comments null when parse can't reuse
  // (mismatched bytes, mode that rewrote pre's output, or pre stored nulls intentionally)
  takeWithParse(id, code) {
    const stored = this.take(id);
    if (!stored) return { snapshot: null, ast: null, comments: null };
    const canReuse = stored.ast && stored.postInput === code;
    return {
      snapshot: stored.snapshot,
      ast: canReuse ? stored.ast : null,
      comments: canReuse ? stored.comments : null,
    };
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
