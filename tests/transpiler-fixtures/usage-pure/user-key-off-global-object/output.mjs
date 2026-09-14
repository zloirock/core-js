import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A USER key off the global object itself names no surface the plugin models: an instance leaf
// under it is a name match both legs keep native, on every declaration host.
export const {
  y: {
    at: constAt
  }
} = _globalThis;
export let {
  y: {
    at: letAt
  }
} = _globalThis;
const [{
  y: {
    at: wrappedAt
  }
}] = [_globalThis];
const [{
  y: {
    at: siblingAt
  }
}, tail] = [_globalThis, 1];
const first = 1,
  {
    y: {
      at: multiAt
    }
  } = _globalThis;
// A user object resolves the leaf through its own type and keeps the claim.
const source = {
  y: [1, 2]
};
const sourceAt = _atMaybeArray(source.y);
export { wrappedAt, siblingAt, multiAt, sourceAt, first, tail };