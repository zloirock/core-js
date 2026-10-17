// NEGATIVE: no parens, so the `!` is chain-transparent and the whole chain short-circuits
export const unsealedNonNull = globalThis.window?.self!.Symbol?.iterator;
