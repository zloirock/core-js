// a METHOD-only usage injects just that method - the namespace VALUE entry must not appear:
// the method module carries everything the call needs, bare and through a proxy hop alike
export const t1 = Math.trunc(2.7);
export const s2 = globalThis.Math.sign(-3);

