// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
for (const { Array: { from } } = globalThis, { at, ...rest } = arr; cond(); next()) use(from, at, rest);
for (const { Array: { of: of2 } } = globalThis, { flat, plain } = arr; cond(); next()) use(of2, flat, plain);
for (const { Array: { isArray } } = globalThis, { ['includes']: inc } = arr; cond(); next()) use(isArray, inc);
for (const { Array: { fromAsync } } = globalThis, { indexOf, lastIndexOf } = arr; cond(); next()) use(fromAsync, indexOf, lastIndexOf);
// a defaulted instance entry memoizes; the memo `var` lands BEFORE the loop (the
// loop-header escape), not in a block-converted bodyless body
for (const { Object: { entries } } = globalThis, { findLast = dflt } = arr; cond(); next()) use(entries, findLast);
// an SE-bearing receiver keeps its evaluation point through the sink declarator
for (const { Object: { keys } } = globalThis, { findIndex, ...r2 } = getArr(); cond(); next()) use(keys, findIndex, r2);
