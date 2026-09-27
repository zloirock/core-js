import "core-js/modules/es.string.at";
// @flow
// A constructor alias keeps the declared static field type through typeof.
declare class C {
  static items: string
}
const D = C;
function read(x: typeof D.items) {
  return x.at(0);
}