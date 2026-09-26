// `interface Map` is a TS type-only declaration: tsc elides it, at runtime Map IS the global.
// `scope.getBinding('Map')` returns the interface binding either way, so the shadow check must
// filter ambient bindings, else Map is misclassified as user-shadowed and `new Map()` collapses
// to the un-polyfilled identifier (fails on old engines). parallel to the `declare const` test
interface Map {
  size: number;
  has(v: any): boolean;
}
const m = new Map();
m.has(1);
