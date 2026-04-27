// option validation. consumes raw user options and throws TypeError with `[core-js]` prefix
// when shape mismatches the public API contract. also enforces conflict rules (`include` /
// `exclude` vs `shouldInjectPolyfill`). adversarial-input hardening across the file: any
// downstream `String(value)` / `value.constructor.name` access wraps in try/catch so a
// throwing Proxy can't mask the primary option-type error with a secondary diagnostic
import { safeStringify, validatePatternList } from '../helpers/pattern-matching.js';

// JSON.stringify renders NaN/Infinity as `null` and Symbol/undefined/function as `undefined` -
// useless for type-mismatch diagnostics; use their native toString for the outliers.
// class instances serialize as plain `{…}` - prefix with constructor name so users distinguish
// `new Targets()` from `{ ie: 11 }` object-literal in the error.
// `safeStringify` (shared helper) wraps `JSON.stringify` in try/catch so circular structures
// and adversarial Proxy traps don't mask the primary option error with a stringify crash
function formatReceived(value) {
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') {
    // adversarial function with throwing `.name` getter - same defensive rationale as the
    // `.constructor?.name` try/catch below: don't let formatReceived throw a secondary error
    // while the primary option-type error is being built. also coerce through String() inside
    // try/catch to cover Symbol.toPrimitive on the `.name` result (adversarial Proxy)
    let fnName = null;
    try {
      const raw = value.name;
      fnName = typeof raw === 'string' ? raw : null;
    } catch { /* swallow */ }
    return `[Function${ fnName ? ` ${ fnName }` : '' }]`;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
  // JSON.stringify throws on BigInt; formatting as `42n` keeps the option-type error
  // readable instead of degrading to `[Object]`
  if (typeof value === 'bigint') return `${ value }n`;
  if (value === undefined) return 'undefined';
  if (typeof value === 'object' && value !== null && !isPlainObject(value) && !Array.isArray(value)) {
    // adversarial Proxy may throw on `.constructor` access - defensive, so formatReceived
    // never throws a secondary error while we're already reporting the primary one
    let ctorName = null;
    try {
      ctorName = value.constructor?.name;
    } catch { /* swallow */ }
    return ctorName && ctorName !== 'Object' ? `[${ ctorName }] ${ safeStringify(value) }` : safeStringify(value);
  }
  return safeStringify(value);
}

function optionTypeError(name, expected, received) {
  return new TypeError(`[core-js] \`${ name }\` must be ${ expected } (received ${ formatReceived(received) })`);
}

// `null`/`undefined` pass through so users can use conditional spreads to clear an option
const isEmpty = v => v === null || v === undefined;

// accepts `Object.create(null)` alongside `Object.prototype`-backed objects
function isPlainObject(value) {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export const VALID_METHODS = new Set(['entry-global', 'usage-global', 'usage-pure']);
export const VALID_MODES = new Set(['es', 'stable', 'actual', 'full']);
const formatOptions = set => `one of ${ [...set].map(s => `'${ s }'`).join(', ') }`;

function expectOptional(name, type, value) {
  if (!isEmpty(value) && typeof value !== type) throw optionTypeError(name, `a ${ type }, or undefined`, value);
}

function expectEnum(name, set, value, { required = true } = {}) {
  if (required ? !set.has(value) : !isEmpty(value) && !set.has(value)) {
    throw optionTypeError(name, formatOptions(set), value);
  }
}

// option keys not in the validated allowlist are passed through to `createPolyfillContext` as-is.
// `KNOWN_REST_KEYS` matches the `...rest` keys in `initPluginOptions` so the unknown-option
// pre-check stays in sync (any new field destructured in initPluginOptions must be added here)
export const KNOWN_REST_KEYS = new Set([
  'additionalPackages',
  'method',
  'mode',
  'package',
  'version',
]);

export function validateOptions({
  absoluteImports,
  additionalPackages,
  browserslistEnv,
  configPath,
  debug,
  exclude,
  ignoreBrowserslistConfig,
  importStyle,
  include,
  method,
  mode,
  package: pkg,
  shippedProposals,
  shouldInjectPolyfill,
  targets,
  version,
}) {
  expectEnum('method', VALID_METHODS, method);
  expectEnum('mode', VALID_MODES, mode, { required: false });
  if (!isEmpty(importStyle) && importStyle !== 'import' && importStyle !== 'require') {
    throw optionTypeError('importStyle', "'import' or 'require'", importStyle);
  }
  expectOptional('absoluteImports', 'boolean', absoluteImports);
  expectOptional('debug', 'boolean', debug);
  expectOptional('ignoreBrowserslistConfig', 'boolean', ignoreBrowserslistConfig);
  expectOptional('shippedProposals', 'boolean', shippedProposals);
  expectOptional('configPath', 'string', configPath);
  expectOptional('browserslistEnv', 'string', browserslistEnv);
  // semver-shape validated downstream in `normalizeCoreJSVersion`; here only verify the
  // shape is string-or-undefined to surface `[core-js]`-prefixed error on non-string input
  // (number / boolean / null) BEFORE `createPolyfillContext` sees it
  expectOptional('version', 'string', version);
  if (!isEmpty(shouldInjectPolyfill) && typeof shouldInjectPolyfill !== 'function') {
    throw optionTypeError('shouldInjectPolyfill', 'a function, or undefined', shouldInjectPolyfill);
  }
  // shape-validate include/exclude before the conflict check below. otherwise a config
  // like `{ include: [42n], shouldInjectPolyfill: fn }` surfaces "conflict with shouldInjectPolyfill"
  // and hides the real error (bad element type) until the caller resolves the conflict first
  validatePatternList('include', include);
  validatePatternList('exclude', exclude);
  // empty arrays don't conflict with shouldInjectPolyfill - only non-empty include/exclude do
  if (typeof shouldInjectPolyfill === 'function' && (include?.length || exclude?.length)) {
    throw new TypeError('[core-js] `include` and `exclude` are not supported when using `shouldInjectPolyfill`');
  }
  // `undefined` takes the default downstream; `null` (e.g. `{ package: cond ? 'x' : null }`)
  // is a real mis-configuration and should surface as a type error, not a late TypeError
  // pure-slash strings (`/`, `///`) are stripped to `''` by `createPolyfillContext.stripTrailingSlashes`,
  // making `getCoreJSEntry` treat any `/`-prefixed user import as a core-js entry. reject up
  // front so the misconfiguration surfaces as a clean type error
  const isPureSlash = $pkg => /^\/+$/.test($pkg);
  if (pkg !== undefined) {
    if (typeof pkg !== 'string') throw optionTypeError('package', 'a string', pkg);
    if (pkg === '' || isPureSlash(pkg)) throw optionTypeError('package', 'a non-empty, non-slash-only string', pkg);
  }
  if (additionalPackages !== undefined && additionalPackages !== null) {
    if (!Array.isArray(additionalPackages)) {
      throw optionTypeError('additionalPackages', 'an array, or undefined', additionalPackages);
    }
    // `.find(...)` collides with the sentinel: `additionalPackages: ['ok', undefined]`
    // matches on the `undefined` item but returns `undefined`, so `!== undefined` skips
    // the throw and crashes later at `p.toLowerCase()` inside `createPolyfillContext`.
    // `findIndex` disambiguates: `-1` is not-found, `>= 0` is a real hit
    const badIndex = additionalPackages.findIndex($pkg => typeof $pkg !== 'string');
    if (badIndex !== -1) throw optionTypeError('additionalPackages[*]', 'a string', additionalPackages[badIndex]);
    const emptyOrSlashIndex = additionalPackages.findIndex($pkg => $pkg === '' || isPureSlash($pkg));
    if (emptyOrSlashIndex !== -1) {
      throw optionTypeError('additionalPackages[*]', 'a non-empty, non-slash-only string', additionalPackages[emptyOrSlashIndex]);
    }
    // note: duplicates (including case-variants) silently dedup in `createPolyfillContext`
    // - documented design, see `audit-additional-packages-dedup`
  }
  // positive whitelist for `targetsParser`: `function` / `boolean` / `number` / etc. trigger
  // opaque "Unknown browser query" from browserslist downstream - reject them here.
  // empty string silently triggers the browserslist-config fallback (`''` is falsy), which
  // looks like an accidental mis-configuration rather than an intentional opt-out.
  // any object (plain, class instance, Object.create, array, ...) passes through to
  // `targetsParser` - shape validation is its concern, not the plugin's
  if (!isEmpty(targets)) {
    if (typeof targets !== 'string' && typeof targets !== 'object') {
      throw optionTypeError('targets', 'a string, array, or object', targets);
    }
    // empty string and empty array both silently fall back to browserslist defaults downstream,
    // which looks like accidental mis-configuration - reject symmetrically
    if (targets === '' || (Array.isArray(targets) && !targets.length)) {
      throw optionTypeError('targets', 'a non-empty string, array, or object', targets);
    }
  }
}

