// `interface Map` is a TS type-only declaration: tsc elides it, at runtime Map IS the
// global. raw `scope.getBinding('Map')` returns the interface binding either way, so
// without an ambient binding filter filter the shadow check classifies Map as user-shadowed
// and isGlobalProxy bails. polyfill emission for `new Map()` then collapses to the
// un-polyfilled identifier - fails on old engines without the global. parallel coverage
// to the `declare const` test: both shapes resolve through the same ambient filter
interface Map {
  size: number;
  has(v: any): boolean;
}
const m = new Map();
m.has(1);
