import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
type AliasThenable<T> = {
  then: (cb: (v: T) => any) => AliasThenable<T>
};
async function aliasProbe(c: AliasThenable<Array<string>>) {
  var _ref;
  _includesMaybeArray(_ref = await c).call(_ref, 'x');
}
aliasProbe();