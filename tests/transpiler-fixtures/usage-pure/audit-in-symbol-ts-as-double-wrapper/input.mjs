// doubled TS `as` cast around Symbol. plugin peels both wrappers to see the underlying
// Symbol identifier and polyfills `Symbol.iterator` through `isIterable(obj)` rewrite
((Symbol as any) as any).iterator in obj;
