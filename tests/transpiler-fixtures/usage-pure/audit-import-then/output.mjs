import _at from "@core-js/pure/actual/instance/at";
// ImportExpression returns Promise. Member call on Promise's returned module shape
// must dispatch through Promise instance member resolution.
import('mod').then(mod => {
  var _ref;
  _at(_ref = mod.items).call(_ref, 0);
});