import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
try {} catch (_ref) {
  let iter = _getIteratorMethod(_ref);
  for (const x of {
    [iter]: () => ({
      next() {
        return {
          done: true
        };
      }
    })
  }) {}
}