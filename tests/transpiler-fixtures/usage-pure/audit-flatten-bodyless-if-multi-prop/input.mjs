// nested-proxy declaration flatten with multiple polyfillable props inside an unbraced
// if body. each prop becomes a `binding = polyfill` declarator of the one `var` the slot
// holds; as separate statements only the first would stay gated, the rest hoisted out of the if
if (cond) var { Array: { from }, Object: { fromEntries } } = globalThis;
