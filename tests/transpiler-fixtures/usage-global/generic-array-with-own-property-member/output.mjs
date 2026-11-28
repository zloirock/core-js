import "core-js/modules/es.object.assign";
import "core-js/modules/es.array.at";
function w<T>(x: T): {
  v: T;
} {
  return {
    v: x
  };
}
w(Object.assign([7], {
  a: 1
})).v.at(0);