// the value-vs-ambient gate covers the CLASS lookups too. its discriminator is scope, not the
// bare presence of a binding: an overload HEAD and its implementation are one declaration
// entity sharing one name, and only a NARROWER binding really stands in front of the ambient one
declare class Holder {
  pick(): number[];
}
declare function heads(): number[];
export function shadowed(Holder: {
  new (): {
    pick(): string;
  };
}) {
  return new Holder().pick().at(0);
}
export function unshadowed() {
  return heads().includes(1);
}
