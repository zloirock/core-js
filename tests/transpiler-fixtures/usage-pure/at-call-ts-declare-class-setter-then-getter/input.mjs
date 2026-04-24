declare class Store {
  set value(_v: number[]);
  get value(): number[];
}
declare const s: Store;
// setter declared before the matching getter - read access `s.value` must resolve
// through the getter's return type `number[]`, not the setter's argument type,
// so `.at(0)` routes to the array-specific polyfill
s.value.at(0);
