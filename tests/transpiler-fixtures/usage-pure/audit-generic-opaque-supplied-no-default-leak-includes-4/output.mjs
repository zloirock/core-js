import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// channel: annotation-domain member chain - a LITERAL arg carries its trivially-known type
// (the inference domain reads declared annotations, so literals needed a keyword bridge);
// an opaque arg through the same chain stays generic
type Wrap<T> = {
  v: T;
};
function wrapIt<T = string>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
_includesMaybeArray(_ref = wrapIt([1, 2]).v).call(_ref, 1);