// a METHOD-only usage injects just that method - the namespace VALUE entry must not appear:
// the method module carries everything the call needs, bare and through a proxy hop alike
export const s1 = JSON.stringify({ a: 1 });
export const r2 = globalThis.JSON.isRawJSON(x);

