// `import X from 'my-lib/symbol/iterator'` is NOT a core-js Symbol re-export -
// `bindingSymbolKey` filters via CORE_JS_SOURCE_PREFIX regex. user binding `it` keeps its
// non-Symbol semantics; `it in obj` should fall back to plain string-key path, NOT
// is-iterable polyfill. parallel concern for ImportSpecifier non-default
import _it from 'my-lib/symbol/iterator';
import { default as _other } from 'unrelated/symbol/asyncIterator';
const a = _it in [];
const b = _other in {};
export { a, b };
