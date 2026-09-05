import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// Flow dialect of the supplied-but-opaque rule: a nullable (`?T`) or union param wrapper
// blocks direct inference, so a present-but-untypeable arg must degrade to the generic
// helper instead of leaking the declared default; a bare-T param still binds the arg type
declare var opaque: Foo;
function nullable<T = string>(x: ?T): T {
  return (x: any);
}
nullable(opaque).at(0);
function unioned<T = string>(x: T | null): T {
  return (x: any);
}
unioned(opaque).includes(1);
function bare<T = number[]>(x: T): T {
  return x;
}
bare('abc').at(0);