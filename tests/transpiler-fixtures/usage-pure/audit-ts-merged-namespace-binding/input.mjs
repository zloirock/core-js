// a declaration-merged runtime namespace (`declare const` + `namespace`) emits a real var
// after the TS transform: the use stays on the USER binding (an ambient shape alone is not
// authoritative). a pure ambient declare still polyfills
// @ts-expect-error merged declarations tsc refuses are the shape under test
declare const Map: any;
// @ts-expect-error merged declarations tsc refuses are the shape under test
namespace Map { export const x = 1; }
export const m = new Map();
declare const Iterator: any;
export const i = Iterator.from(y);
// an ambient FUNCTION declare is tsc-elided like the const form - the use polyfills
declare function Promise(): void;
// @ts-expect-error the ambient declaration types the read for tsc alone, and the runtime reads the global
export const p = Promise.try(fn);
