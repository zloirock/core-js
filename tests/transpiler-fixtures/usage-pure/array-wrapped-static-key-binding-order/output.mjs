import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// Shared capture and receiver-default routes preserve independently supported claims.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
let seen;
function observe() {
  try {
    seen = typeof from;
  } catch (error) {
    seen = _nameMaybeFunction(error);
  }
}
const [{}, _ref] = [Array, {}],
  from = (observe(), _Array$from),
  other = _ref;
export const result = [seen, from([7]), other];