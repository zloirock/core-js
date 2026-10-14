import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
// A paren around the root of a member target, or around an object on its chain, spells the same slot in the
// JS dialect too: the target takes the ponyfill like its bare twin, a computed sole chain included.
const sink = {},
  deep = {
    a: {}
  };
sink.f = _Array$from;
deep.a.f = _Array$of;
sink[k()] = _Set;