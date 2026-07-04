import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.global-this";
// a METHOD-only usage injects just that method - the namespace VALUE entry must not appear:
// the method module carries everything the call needs, bare and through a proxy hop alike
export const keys1 = Reflect.ownKeys({
  a: 1
});
export const has2 = globalThis.Reflect.has({
  b: 2
}, "b");