import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// capitalized globals appearing ONLY in TS type-member key / id positions are NOT runtime
// references and must inject no polyfill: TSPropertySignature key (`WeakSet`), TSMethodSignature
// key (`Map`), TSMappedType type-parameter name (`Set`), TSEnumMember id (`WeakMap`). a genuine
// runtime use (`Promise.resolve`) still injects - the import set proves only the real reference
// triggered injection, not the type-only member names.
interface I {
  WeakSet: number;
  Map(): void;
}
type M = { [Set in K]: 1 };
enum E {
  WeakMap
}
Promise.resolve(1);