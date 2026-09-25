import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.values";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.entries";
import "core-js/modules/web.dom-collections.values";
// a NAMESAKE of a local callee bound in another scope - a parameter of some other function, a local
// of another body - is no read of the callee: its caller set stays closed, the argument pairs with the
// parameter and the returned slot's static read takes the runtime identity guard against it. the
// escaping callback literal is what the escape census classifies before the container census runs.
// constructors only: an unknown index keeps a NAMESPACE's whole family (no constructor selection)
export const escaping = {
  of: () => other
};
const key = [0].pop();
function relabel(box1) {
  return box1;
}
function box1(value) {
  return [value];
}
export const viaParam = box1(Array)[key].from([1]);
function relabelDefault(box2 = 1) {
  return box2;
}
function box2(value) {
  return [value];
}
export const viaDefaultedParam = box2(Object)[key].entries({});
function relabelPattern({
  box3
}) {
  return box3;
}
function box3(value) {
  return [value];
}
export const viaPatternParam = box3(Array)[key].of(1);
const relabelArrow = box4 => box4;
function box4(value) {
  return [value];
}
export const viaArrowParam = box4(String)[key].raw`x`;
const relabelling = {
  relabel(box5) {
    return box5;
  }
};
function box5(value) {
  return [value];
}
export const viaMethodParam = box5(String)[key].fromCodePoint(65);
function elsewhere() {
  const box6 = 1;
  return box6;
}
function box6(value) {
  return [value];
}
export const viaForeignLocal = box6(Object)[key].values({});