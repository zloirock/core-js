// Ambient declaration-merge shape (the typical `.d.ts` style for a typed
// third-party API): `declare class AmbientLib` merged with a sibling
// `declare namespace AmbientLib { export function create(): AmbientLib }`.
// The static `AmbientLib.create()` resolves to the user's class instance, so
// `.at(0)` on the result must NOT emit `es.array.at` - the user class has no
// `at` method and there is no Array-typed receiver.
declare class AmbientLib {
  doSomething(): void;
}
declare namespace AmbientLib {
  export function create(): AmbientLib;
}

const lib = AmbientLib.create();
lib.at(0);
