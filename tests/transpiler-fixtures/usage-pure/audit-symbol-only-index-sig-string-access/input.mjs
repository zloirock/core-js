// symbol-only index signature, accessed by a string key. the resolver falls back to the
// symbol signature for the non-numeric key - precision-edge (TS would reject the access;
// the plugin is permissive). polyfill dispatch on the returned type still works via the
// signature's value type
interface Bag {
  [k: symbol]: number[];
}
declare const x: Bag;
x['fallback'].at(0);
