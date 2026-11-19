import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A known constructor still has observable instance property reads.
// Its excluded static keeps the earlier slot, as on the nested realm form.
const {
    from
  } = Array,
  name = _nameMaybeFunction(Array);
use(from, name);
export {};