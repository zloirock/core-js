// nested-proxy declaration flatten with multiple polyfillable props inside an unbraced
// if body. each prop becomes a separate `var binding = polyfill;` statement; without
// block-wrapping only the first stays gated, the rest are hoisted out of the if
if (cond) var { Array: { from }, Object: { fromEntries } } = globalThis;
