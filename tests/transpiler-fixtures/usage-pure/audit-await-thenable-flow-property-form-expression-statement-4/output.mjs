import _at from "@core-js/pure/actual/instance/at";
type NotThenable = {
  then: string
};
async function bailProbe(d: NotThenable) {
  var _ref;
  _at(_ref = await d).call(_ref, 0);
}
bailProbe();