// a for-init declaration shared with a proxy-global flatten declarator: the sibling
// destructure renders through the SAME full emitter as every block-level shape - memo,
// residual and rest slots are all valid comma-list declarators, so the polyfill survives
// on every shape (a narrow for-init-only renderer once bailed these to verbatim source,
// dropping the injected polyfill and leaving a dead import)
for (const { Array: { from } } = globalThis, { at, ...rest } = arr; cond(); next()) use(from, at, rest);
for (const { Array: { of: of2 } } = globalThis, { flat, plain } = arr; cond(); next()) use(of2, flat, plain);
for (const { Array: { isArray } } = globalThis, { ['includes']: inc } = arr; cond(); next()) use(isArray, inc);
for (const { Array: { fromAsync } } = globalThis, { indexOf, lastIndexOf } = arr; cond(); next()) use(fromAsync, indexOf, lastIndexOf);
// a defaulted instance entry memoizes; the memo `var` lands BEFORE the loop (the
// loop-header escape), not in a block-converted bodyless body
for (const { Object: { entries } } = globalThis, { findLast = dflt } = arr; cond(); next()) use(entries, findLast);
// an SE-bearing receiver keeps its evaluation point through the sink declarator
for (const { Object: { keys } } = globalThis, { findIndex, ...r2 } = getArr(); cond(); next()) use(keys, findIndex, r2);
