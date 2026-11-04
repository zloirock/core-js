import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A partial mirror keeps the selected receiver and the disabled property on a second pass.
export function read({
  box: {
    marker = -1,
    at
  }
} = {
  box: null ?? source()
}) {
  return [marker, at];
}
export function statics({
  Array: {
    from,
    // core-js-disable-next-line
    of
  }
} = globalThis) {
  return [from, of];
}