// the shadow holds in a type-ARGUMENT too, which resolves through a different lane than an
// annotation written directly on the binding
type Boxed<T> = { inner: T; };

function inArgument<Array>(x: Boxed<Array>) {
  return x.inner.join("-");
}
