import _Array$of from "@core-js/pure/actual/array/of";
// The first binding receives its fallback before the computed key reads it in the IIFE.
(function pick({
  of = arguments.length && arguments[0] !== void 0 ? void 0 : _Array$of,
  [of]: picked
} = Array) {
  return [of, picked];
})();