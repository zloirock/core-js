var _Reflect$ownKeys2;
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// `Reflect.ownKeys` + computed property `[s]` in an object literal. the static call
// polyfills via an imported binding; a sibling transform lowers the computed key and
// allocates its own temp. both must get distinct names so the temp doesn't shadow the
// import and turn the call into `undefined is not a function`
_Reflect$ownKeys((_Reflect$ownKeys2 = {
  a: 1
}, _Reflect$ownKeys2[s] = 2, _Reflect$ownKeys2));