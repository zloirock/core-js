import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// An excluded sibling keeps the receiver memo, including its sealed navigation.
// The inner instance claim stays live and the receiver call runs once.
function read({
  of,
  from
} = ((() => {
  [7].at(0);
  return globalThis.window;
})()?.self).Array) {
  return [of(3), from([4])];
}
read();