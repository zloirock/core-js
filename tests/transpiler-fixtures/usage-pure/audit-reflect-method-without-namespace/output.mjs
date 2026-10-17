import _Reflect$has from "@core-js/pure/actual/reflect/has";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// a METHOD-only usage injects just that method - the namespace VALUE entry must not appear:
// the method module carries everything the call needs, bare and through a proxy hop alike
export const keys1 = _Reflect$ownKeys({
  a: 1
});
export const has2 = _Reflect$has({
  b: 2
}, "b");