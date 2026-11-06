import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
interface IfaceThenable<T> {
  then(cb: (v: T) => any): IfaceThenable<T>
}
async function ifaceProbe(b: IfaceThenable<string>) {
  var _ref;
  _includesMaybeString(_ref = await b).call(_ref, 'x');
}
ifaceProbe();