// variant of nested-symbol-key-in with Symbol.asyncIterator (no iterator-method
// fast-path). `in` rewrite still bails on the nested-symbol pattern; receiver Symbol
// and inner Symbol.asyncIterator polyfilled via ordinary identifier / Symbol-member paths
const y = Symbol[Symbol.asyncIterator] in obj;
globalThis.__y = y;
