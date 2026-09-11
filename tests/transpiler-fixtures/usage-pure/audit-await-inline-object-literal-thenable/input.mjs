// an INLINE object-literal thenable annotation (`declare const t: { then(...) }`, not an alias):
// the annotation is a TSTypeLiteral directly, so peelUserThenable must accept it (not only
// TSTypeReference) and the await null-receiver-type fallback runs - `await t` is `string[]`, array `.at`
declare const t: { then(cb: (v: string[]) => any): void };
async function go() { const arr = await t; arr.at(0); }
