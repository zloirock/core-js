// option validation. throws `[core-js]`-prefixed TypeError on shape mismatch.
// defensive try/catch around foreign attribute reads keeps an adversarial Proxy
// from masking the primary error with a secondary stringify/getter crash
import { safeStringify, validatePatternList } from '../helpers/pattern-matching.js';

// JSON.stringify drops/null-renders BigInt, NaN, Infinity, Symbol, function - explicit
// branches for those so the diagnostic stays distinguishable
function formatReceived(value) {
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') {
    let fnName = null;
    try {
      const raw = value.name;
      fnName = typeof raw === 'string' ? raw : null;
    } catch { /* swallow */ }
    return `[Function${ fnName ? ` ${ fnName }` : '' }]`;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
  if (typeof value === 'bigint') return `${ value }n`;
  if (value === undefined) return 'undefined';
  if (typeof value === 'object' && value !== null && !isPlainObject(value) && !Array.isArray(value)) {
    // class-instance prefix lets users distinguish `new Targets()` from a plain-object literal
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

// null/undefined symmetric so conditional spread (`{ debug: cond ? true : null }`) clears
function isEmpty(v) {
  return v === null || v === undefined;
}

// accepts `Object.create(null)` alongside `Object.prototype`-backed objects.
// throwing Proxy `getPrototypeOf` -> conservatively NOT plain (falls through to ctor-named path)
function isPlainObject(value) {
  if (typeof value !== 'object' || value === null) return false;
  try {
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
  } catch {
    return false;
  }
}

export const VALID_METHODS = new Set(['entry-global', 'usage-global', 'usage-pure']);
export const VALID_MODES = new Set(['es', 'stable', 'actual', 'full']);

function formatOptions(set) {
  return `one of ${ [...set].map(s => `'${ s }'`).join(', ') }`;
}

function expectOptional(name, type, value) {
  if (!isEmpty(value) && typeof value !== type) throw optionTypeError(name, `a ${ type }, null, or undefined`, value);
}

function expectEnum(name, set, value, { required = true } = {}) {
  if (required ? !set.has(value) : !isEmpty(value) && !set.has(value)) {
    throw optionTypeError(name, formatOptions(set), value);
  }
}

// pure-slash names (`/`, `///`) strip to `''` in `stripTrailingSlashes` and would let any
// `/`-prefixed user import match a core-js entry
const PURE_SLASH_RE = /^\/+$/;

function expectPackageName(label, value) {
  if (typeof value !== 'string') throw optionTypeError(label, 'a string', value);
  if (value === '' || PURE_SLASH_RE.test(value)) {
    throw optionTypeError(label, 'a non-empty, non-slash-only string', value);
  }
}

// must stay in sync with the `...rest` destructure in `initPluginOptions`
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
  // configPath / browserslistEnv accept '' for env-var passthrough (`process.env.X || ''`);
  // targets rejects empty as suspicious. asymmetric by design
  expectOptional('configPath', 'string', configPath);
  expectOptional('browserslistEnv', 'string', browserslistEnv);
  // semver-shape validated downstream in normalizeCoreJSVersion; here only shape-check
  expectOptional('version', 'string', version);
  if (!isEmpty(shouldInjectPolyfill) && typeof shouldInjectPolyfill !== 'function') {
    throw optionTypeError('shouldInjectPolyfill', 'a function, null, or undefined', shouldInjectPolyfill);
  }
  // shape-check include/exclude BEFORE the conflict check, otherwise bad element types
  // hide behind the conflict diagnostic
  validatePatternList('include', include);
  validatePatternList('exclude', exclude);
  if (typeof shouldInjectPolyfill === 'function' && (include?.length || exclude?.length)) {
    throw new TypeError('[core-js] `include` and `exclude` are not supported when using `shouldInjectPolyfill`');
  }
  // null-handling asymmetry: `package` rejects null (single value with no default to clear);
  // `additionalPackages` accepts null (matches the conditional-spread `isEmpty` convention)
  if (pkg !== undefined) expectPackageName('package', pkg);
  if (!isEmpty(additionalPackages)) {
    if (!Array.isArray(additionalPackages)) {
      throw optionTypeError('additionalPackages', 'an array, null, or undefined', additionalPackages);
    }
    // first-bad-wins; index in the label points users into long lists
    for (const [i, item] of additionalPackages.entries()) expectPackageName(`additionalPackages[${ i }]`, item);
  }
  // positive whitelist; non-string/non-object falls through to opaque `targetsParser` error.
  // empty string/array would silently trigger browserslist-config fallback - suspicious
  if (!isEmpty(targets)) {
    if (typeof targets !== 'string' && typeof targets !== 'object') {
      throw optionTypeError('targets', 'a string, array, or object', targets);
    }
    if (targets === '' || (Array.isArray(targets) && !targets.length)) {
      throw optionTypeError('targets', 'a non-empty string, array, or object', targets);
    }
  }
}

