// bodyless-if host blockifies and the effect stays CONDITIONAL (runs only with the branch)
let ok;
if (cond) ({ self: { isSecureContext: ok } } = (eff(), globalThis));
export const r = [ok];
