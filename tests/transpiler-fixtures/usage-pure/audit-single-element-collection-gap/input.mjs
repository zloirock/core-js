// indexed access into a generic type whose property is itself an array:
// `Items<string>['data']` reduces to `string[]`, so `.at()` and `.flat()` should
// dispatch to the Array-specific instance polyfills
type Items<T> = { data: T[] };
declare const i: Items<string>['data'];
i.at(0);
i.flat();
