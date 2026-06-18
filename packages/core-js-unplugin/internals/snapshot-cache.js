import {
  stripQueryHash,
  WINDOWS_UNC_PREFIX_RE,
} from '@core-js/polyfill-provider/helpers/path-normalize';
import { isSfcSubBlock, parseModuleId } from './sfc-shapes.js';

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
// canonical `file:///abs/path` triple-slash form. `(?=\/)` lookahead pins the optional
// host to localhost only: `file://otherhost/path` doesn't match `localhost`, doesn't
// follow with `/` after the empty optional group either, so the regex passes through
const VITE_SCHEME_PREFIX_RE = /^(?:file:\/\/(?:localhost)?(?=\/)|\/@fs(?=\/|$)|\/@id\/)/i;
const REPEATED_SLASHES_RE = /\/{2,}/g;
const QUERY_OR_HASH_RE = /[#?]/;
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

// SFC sub-block tail (`?vue&type=script&lang=ts`) identifies the block but parameter order
// is bundler-dependent (vite vs farm vs custom). canonicalise by sorting `&`-separated tokens
// so `?vue&type=script&lang=ts` and `?vue&lang=ts&type=script` hash to the same cache entry.
// hash suffix `#x` is preserved at the end (always lex-last; doesn't participate in the
// sort). empty token segments (`&&` collapse) are filtered out
function normalizeSFCQueryTail(tail) {
  if (!tail) return tail;
  const hashIdx = tail.indexOf('#');
  const querySrc = hashIdx === -1 ? tail.slice(1) : tail.slice(1, hashIdx);
  const hash = hashIdx === -1 ? '' : tail.slice(hashIdx);
  const tokens = querySrc.split('&').filter(Boolean).sort();
  return `?${ tokens.join('&') }${ hash }`;
}

// an id earns the query-preserving (sub-block) key when it is an SFC sub-block: framework-marked
// (`?vue&type=script&lang=ts`, incl. style / template blocks, which still need a distinct key) OR a
// markerless `lang=`-admitted JS block (`?type=script&lang=ts`). a distinct sub-block needs a distinct
// snapshot key, else two sub-blocks of one file collapse to the stripped path key and cross-contaminate
// imports in `phase: 'pre+post'`. delegates to the shared structured predicate so the cache-key SFC
// detection and `shouldTransform`'s admission can never drift apart on the same query shapes
function isTransformableSfcSubBlock(id) {
  return isSfcSubBlock(parseModuleId(id).params);
}

function normalizeKey(id) {
  const cleanId = stripHMRTimestamp(id);
  if (isTransformableSfcSubBlock(cleanId)) {
    // strip Windows UNC verbatim prefix (`\\?\C:\...` / `//?/C:/...`) BEFORE the SFC split,
    // otherwise `cleanId.search(/[#?]/)` matches the embedded `?` of the UNC prefix at index
    // 2 instead of the SFC `?vue&type=...` boundary. without this, pre-on-Windows-UNC and
    // post-on-canonical-form keys diverge, snapshot miss for the same logical SFC sub-block
    const uncStripped = cleanId.replaceAll('\\', '/').replace(WINDOWS_UNC_PREFIX_RE, '');
    // preserve + canonicalise the query since it identifies the sub-block; still normalize
    // the path prefix. sort query params so `?vue&type=script&lang=ts` and `?vue&lang=ts&
    // type=script` resolve to the same cache key
    const queryStart = uncStripped.search(QUERY_OR_HASH_RE);
    const pathPart = queryStart === -1 ? uncStripped : uncStripped.slice(0, queryStart);
    const tail = queryStart === -1 ? '' : normalizeSFCQueryTail(uncStripped.slice(queryStart));
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

  // parse reuse requires `postInput` byte-equality with current code - sibling plugins may
  // have mutated text between passes, and only matching bytes guarantee AST position fidelity.
  // null `stored` (cache miss) and null `stored.ast` (pre stored nulls intentionally) both
  // collapse to the same empty shape; non-null ast with mismatched bytes nulls the ast/comments
  // but still surfaces the snapshot so callers can use the bag-of-globals without reparse
  static #withParseShape(stored, code) {
    if (!stored) return { snapshot: null, ast: null, comments: null, preRewroteSource: false };
    const canReuse = stored.ast && stored.postInput === code;
    return {
      snapshot: stored.snapshot,
      ast: canReuse ? stored.ast : null,
      comments: canReuse ? stored.comments : null,
      // whether pre rewrote the source (emitted a content map); gates post's sourcesContent chaining
      preRewroteSource: !!stored.preRewroteSource,
    };
  }

  // non-destructive parse-reuse lookup: returns the cached snapshot plus whether pre's parse
  // (AST / comments) can be reused for `code`, leaving the snapshot in place. used by callers that
  // need to inspect the cached AST (disable-directive scan) before deciding whether to commit to
  // the snapshot. on the commit path, callers follow up with `take(id)` to drop the entry; on bail
  // paths the snapshot survives so a subsequent retry can still consume it
  peekWithParse(id, code) {
    return SnapshotCache.#withParseShape(this.#snapshots.get(normalizeKey(id)), code);
  }

  // per-file invalidation hook for Vite/Rollup `watchChange`. drops the bare-path snapshot
  // AND any SFC sub-block entries (`/abs/App.vue?vue&type=script&lang=ts`, `?vue&type=template`
  // etc.) that share the same source file. without sub-block fanout, edits to an SFC would
  // leave the script/template/style snapshots stale in cache indefinitely (the cache has no
  // size cap). bounds growth in long-running dev servers where a pre-pass ran but the matching post
  // was skipped (tree-shake, sibling bail). returns true when any entry was removed
  invalidate(id) {
    const key = normalizeKey(id);
    let removed = this.#snapshots.delete(key);
    // sub-block keys have the bare path as a `?`-suffix prefix - sweep them too
    const prefix = `${ key }?`;
    for (const k of this.#snapshots.keys()) {
      if (k.startsWith(prefix)) {
        this.#snapshots.delete(k);
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
