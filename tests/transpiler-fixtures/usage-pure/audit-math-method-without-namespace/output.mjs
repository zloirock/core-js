import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// a METHOD-only usage injects just that method - the namespace VALUE entry must not appear:
// the method module carries everything the call needs, bare and through a proxy hop alike
export const t1 = _Math$trunc(2.7);
export const s2 = _Math$sign(-3);