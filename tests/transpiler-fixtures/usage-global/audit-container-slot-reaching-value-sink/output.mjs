import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/web.dom-collections.entries";
// An escaped slot keeps its original static candidate and may also hold an instance.
const ce = {
  e: Object
};
export function sink(x) {
  return x;
}
sink(ce);
const {
  e: {
    entries: escapedLiteralOnly
  }
} = ce;
export { escapedLiteralOnly };