// ambient form: `declare class Foo` + `declare namespace Foo { export function f() }`.
// `.d.ts`-style pattern for typed third-party libs. namespace walk also matches ambient
// `TSDeclareFunction` leaves so the merge-aware lookup fires equally on declared APIs
declare class AmbientLib {
  doSomething(): void;
}
declare namespace AmbientLib {
  export function create(): AmbientLib;
}

const lib = AmbientLib.create();
lib.at(0);
