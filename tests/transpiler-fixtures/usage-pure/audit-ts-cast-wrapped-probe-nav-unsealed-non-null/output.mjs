import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// NEGATIVE: no parens, so the `!` is chain-transparent and the whole chain short-circuits
export const unsealedNonNull = null == _globalThis.window ? void 0 : _Symbol$iterator;