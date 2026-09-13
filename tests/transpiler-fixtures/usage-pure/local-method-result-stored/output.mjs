import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Storing a fixed local method result does not lose its constructor identity.
// The call stays in the initializer; reading the static does not require the full family.
const source = {
  read() {
    return _Map;
  }
};
const Constructor = source.read();
export const method = _Map$groupBy;