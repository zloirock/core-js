// A shared closed type graph keeps the same receiver family at every branch.
// Repeated aliases must not change the selected helper or broaden the import set.
type C0 = {
  a: 1;
};
type C1 = {
  b: 1;
};
type C2 = C1 & C0;
type C3 = C2 & C1;
type C4 = C3 & C2;
type C5 = C4 & C3;
type C6 = C5 & C4;
type C7 = C6 & C5;
export function f(x: Partial<C7>) {
  // @ts-expect-error a closed object has no at method
  return x.at(0);
}