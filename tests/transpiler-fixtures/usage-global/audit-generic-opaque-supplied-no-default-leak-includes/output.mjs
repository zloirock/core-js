import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// channel: deep param-annotation reference (a union wrapper), arg present but opaque
function fromUnionParam<T = string>(x: T | null): T {
  return x as any;
}
fromUnionParam(new Date()).includes(1);