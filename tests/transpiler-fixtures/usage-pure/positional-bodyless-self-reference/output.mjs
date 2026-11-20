import _includes from "@core-js/pure/actual/instance/includes";
import _values from "@core-js/pure/actual/instance/values";
// A bodyless positional declaration keeps its cyclic value unknown.
// The earlier instance binding is visible to the later initializer element.
if (flag) var [, _ref] = [list, includes],
  {
    a: v
  } = list,
  values = _values(list),
  _ref2 = _ref === void 0 ? [] : _ref,
  includes = _includes(_ref2.inner),
  {
    k: M
  } = _ref2;
consume(v, values, includes, M);