// `import _it from "my-lib/symbol/iterator"` - user library happens to use the same
// `*/symbol/X` path shape as core-js polyfill imports. without the package-prefix filter,
// `bindingSymbolKey` matched `my-lib/symbol/iterator` against SYMBOL_IMPORT_SOURCE and
// classified `_it` as Symbol.iterator, routing the lookup through the polyfill table.
// filter must reject any import whose source is not a known core-js package or namespace
import _it from "my-lib/symbol/iterator";
const arr = [];
export const has = arr[_it];
