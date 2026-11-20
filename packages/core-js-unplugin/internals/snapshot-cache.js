import { fileURLToPath } from 'node:url';
import { stripQueryHash, WINDOWS_UNC_PREFIX_RE } from '@core-js/polyfill-provider/helpers/path-normalize';
import { brand } from '@core-js/polyfill-provider/helpers/error-tag';
import { parseModuleId } from './sfc-shapes.js';

// A file URL encodes its path. A plain filesystem id already names the file literally.
// Preserve the authority on UNC shares and fold only the drive letter on drive paths.
function normalizePath(path) {
  let p = path.replaceAll('\\', '/').replace(/^(?:\/@fs(?=\/|$)|\/@id\/)+/i, '');
  if (/^file:/i.test(p)) {
    try {
      const url = new URL(p);
      const windows = !!url.hostname || /^\/[a-z]:\//i.test(url.pathname);
      p = fileURLToPath(url, { windows });
      p = windows ? p.replaceAll('\\', '/') : p.replace(/^\/+/, '/');
    } catch {
      return p;
    }
  }
  p = p.replace(/^\/\/[.?]\/unc\//i, '//').replace(WINDOWS_UNC_PREFIX_RE, '');
  const share = /^\/\/(?<host>[^/]+)\//.exec(p);
  if (share) p = `//${ share.groups.host.toLowerCase() }${ p.slice(share[0].length - 1).replaceAll(/\/{2,}/g, '/') }`;
  else p = p.replaceAll(/\/{2,}/g, '/');
  return p.replace(/^\/?(?<drive>[a-z]):\//i, (_, drive) => `${ drive.toLowerCase() }:/`);
}

function normalizeKey(id, request, environment = '') {
  // Vite caches metadata per resolved id. Its request token already pairs the stages;
  // keep distinct graph entries independent even if their normalized queries agree.
  if (request) return `${ normalizePath(stripQueryHash(id)) }\0${ environment }\0${ id }`;
  const { path, params, hash } = parseModuleId(id, true);
  const timestamps = params.getAll('t');
  params.delete('t');
  for (const value of timestamps) {
    if (!/^\d+(?:\.\d+)?$/.test(value)) params.append('t', value);
  }
  // Stable key sort preserves the order of repeated values read by getAll().
  params.sort();
  return `${ normalizePath(path) }\0${ environment }\0${ params }${ hash }`;
}

export default class SnapshotCache {
  #snapshots = new Map();
  // Watch invalidation removes the current entry; a still-running request can finish its own code.
  #requests = new WeakMap();
  #debug;

  constructor({ debug = false } = {}) {
    this.#debug = debug;
  }

  store(id, entry, environment, request) {
    const key = normalizeKey(id, request, environment);
    // Hosts without a request token only expose the latest pre for this id.
    if (this.#debug && !request && this.#snapshots.has(key) && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console -- opt-in diagnostic
      console.warn(brand(`pre-pass called twice for ${ id }; latest snapshot wins`));
    }
    this.#snapshots.set(key, entry);
    if (request) this.#requests.set(request, entry);
  }

  take(id, environment, request) {
    const key = normalizeKey(id, request, environment);
    const current = this.#snapshots.get(key);
    const entry = request ? this.#requests.get(request) : current;
    if (request) this.#requests.delete(request);
    if (entry && entry === current) this.#snapshots.delete(key);
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
  peek(id, environment, request) {
    const current = this.#snapshots.get(normalizeKey(id, request, environment));
    const stored = request ? this.#requests.get(request) : current;
    return {
      snapshot: stored?.snapshot ?? null,
      requires: stored?.requires,
      stale: !!stored && stored !== current,
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
    const prefix = `${ normalizePath(stripQueryHash(id)) }\0`;
    let removed = false;
    for (const key of this.#snapshots.keys()) {
      if (key.startsWith(prefix)) {
        this.#snapshots.delete(key);
        removed = true;
      }
    }
    return removed;
  }

  size() { return this.#snapshots.size; }

  reset() {
    this.#snapshots.clear();
    this.#requests = new WeakMap();
  }
}
