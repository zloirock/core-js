// `T[K1 | K2]` indexed access with union K. The indexed-access resolver folds each
// branch through this resolver; verify it integrates with mapped-type rename
// expansion when looking up renamed keys.
type Renamed<T> = { [K in keyof T as `_${K & string}`]: T[K] };
type Source = { items: number[]; tags: string[] };
declare const v: Renamed<Source>['_items' | '_tags'];
v.flat();
