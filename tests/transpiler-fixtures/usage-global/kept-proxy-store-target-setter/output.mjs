import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// A setter target receives the source realm before the static extraction.
const source = {
  set realm(value) {
    mark(value);
  }
};
export const {
  of: read
} = (source.realm = globalThis).Array;