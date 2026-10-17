// nested mirror in a runtime ternary
let cond1 = false;
export function viaMirrorTernary({ Array: { of } } = cond1 ? globalThis.window?.self : { Array: { of: () => 1 } }) { return of; }
