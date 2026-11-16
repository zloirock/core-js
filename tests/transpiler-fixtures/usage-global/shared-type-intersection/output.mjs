import "core-js/modules/es.array.at";
// A shared intersection type graph keeps the same receiver family at every branch.
// Repeated aliases must not change the selected helper or broaden the import set.
type C0 = {
  list: number[];
};
type C1 = {
  list: number[];
};
type C2 = C1 & C0;
type C3 = C2 & C1;
type C4 = C3 & C2;
type C5 = C4 & C3;
type C6 = C5 & C4;
type C7 = C6 & C5;
export function f<U>(x: C7) {
  return x.list.at(0);
}