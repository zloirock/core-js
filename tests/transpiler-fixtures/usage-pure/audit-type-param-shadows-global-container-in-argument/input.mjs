// the shadow holds in a type-ARGUMENT too, which resolves through a different lane than an
// annotation written directly on the binding
type Boxed<T> = { inner: T; };

function inArgument<Array>(x: Boxed<Array>) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return x.inner.join("-");
}
