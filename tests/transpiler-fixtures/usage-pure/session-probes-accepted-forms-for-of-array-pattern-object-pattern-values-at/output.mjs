import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
{
  for (const _ref2 of [[Object, [1]]]) {
    const [{
      values
    }, _ref] = _ref2;
    const at = _atMaybeArray(_ref);
    [values, at];
  }
}