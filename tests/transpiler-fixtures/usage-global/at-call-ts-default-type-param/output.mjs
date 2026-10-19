import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// a type parameter's default is what a call supplying nothing binds; inside the body the
// parameter is whatever the caller passed, so the read stays generic
function foo<T = string[]>(x: T) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  x.at(0);
}

// @ts-expect-error the call supplies nothing, which is what the type parameter default is for
foo();