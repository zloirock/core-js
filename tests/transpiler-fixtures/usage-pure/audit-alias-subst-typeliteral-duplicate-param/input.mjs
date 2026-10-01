// object-literal alias with two members referencing the same inner param; both
// members narrow when the outer alias instantiation propagates substitution
type Twin<U> = {
  left: U;
  right: U;
};
type Box<T> = T[];
type Wrap<T> = Twin<Box<T>>;
declare const x: Wrap<string>;
x.left.at(0);
x.right.flat();
