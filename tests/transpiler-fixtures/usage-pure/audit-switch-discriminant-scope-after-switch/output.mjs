import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
function afterSwitch(x) {
  switch (x) {
    case 1:
      let Symbol = x;
      return Symbol;
  }
  return _getIteratorMethod([]);
}
export { afterSwitch };