import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
// variant of nested-symbol-key-in with Symbol.asyncIterator (no iterator-method
// fast-path). `in` rewrite still bails on the nested-symbol pattern; receiver Symbol
// and inner Symbol.asyncIterator polyfilled via ordinary identifier / Symbol-member paths
const y = _Symbol[_Symbol$asyncIterator] in obj;
_globalThis.__y = y;