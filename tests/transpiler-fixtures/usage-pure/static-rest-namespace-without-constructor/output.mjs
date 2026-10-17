import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
// A namespace entry alone does not authorize replacing the rest source with an index.
const apply = _Reflect$apply,
  {
    apply: _unused,
    ...rest
  } = _Reflect;
export { apply, rest };