// ambient declaration-merge (typical `.d.ts` shape): `declare class AmbientLib` merged with a
// sibling `declare namespace AmbientLib { export function create(): AmbientLib }`. the static
// `AmbientLib.create()` resolves to the user's class instance, so `.at(0)` on the result must
// NOT emit `es.array.at` - the class has no `at` and there is no Array-typed receiver.
declare class AmbientLib {
  doSomething(): void;
}
declare namespace AmbientLib {
  export function create(): AmbientLib;
}
const lib = AmbientLib.create();
// @ts-expect-error the member read is the probe, and the right answer is a type without it
lib.at(0);