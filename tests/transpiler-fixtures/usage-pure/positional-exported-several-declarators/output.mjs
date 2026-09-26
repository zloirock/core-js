import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Several positional captures share one exported declaration without exporting their temporaries.
const [_ref] = rows,
  at = _at(_ref),
  [_ref2] = values;
const includes = _includes(_ref2);
export { at, includes };