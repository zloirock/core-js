import "core-js/modules/es.array.includes";
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
wrapIt([1, 2]).v.includes(1);