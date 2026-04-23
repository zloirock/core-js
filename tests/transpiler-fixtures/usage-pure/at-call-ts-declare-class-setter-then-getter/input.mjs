declare class Store {
  set value(_v: number[]);
  get value(): number[];
}
declare const s: Store;
// setter declared before the matching getter - `b.value` (read access) must resolve
// through the getter's return type, not the setter's arg type. findTypeMember iterates
// class body in source order; setter match must not short-circuit when a getter for the
// same key appears later
s.value.at(0);
