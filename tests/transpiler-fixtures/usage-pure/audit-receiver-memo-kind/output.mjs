import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// the receiver MEMO binds nothing the source named and is written once, so wherever it stands as a
// statement of its own it takes `const` - whatever the host declares. the host's own kind belongs to
// the declarators that carry the source's bindings, which keep it (a `var` one still hoists). the
// exception both legs share is an SE-KEY group, where the memo joins the host's declaration instead
// of standing apart and a joined declarator carries that host's kind
const out = [];
const _ref = [1, 2];
var at = _atMaybeArray(_ref);
var flat = _flatMaybeArray(_ref);
_pushMaybeArray(out).call(out, typeof at, typeof flat);
const _ref2 = [3, 4];
var at2 = _atMaybeArray(_ref2);
var {
  at: _unused,
  ...rest
} = _ref2;
_pushMaybeArray(out).call(out, typeof at2, 'at' in rest);
export { out };