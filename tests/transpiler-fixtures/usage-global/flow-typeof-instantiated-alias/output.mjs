import "core-js/modules/es.string.at";
// @flow
// typeof preserves explicit signature arguments, including those supplied through an alias.
function id<T>(x: T): T {
  return x;
}
type F<U> = typeof id<U>;
function read(fn: F<string>) {
  return fn("abc").at(0);
}