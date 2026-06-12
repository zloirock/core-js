import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a declaration-merged runtime namespace (`declare const` + `namespace`) emits a real var
// after the TS transform: the use stays on the USER binding (an ambient shape alone is not
// authoritative). a pure ambient declare still polyfills
declare const Map: any;
namespace Map {
  export const x = 1;
}
export const m = new Map();
declare const Iterator: any;
export const i = _Iterator$from(y);
// an ambient FUNCTION declare is tsc-elided like the const form - the use polyfills
declare function Promise(): void;
export const p = _Promise$try(fn);