import _includes from "@core-js/pure/actual/instance/includes";
// A leading hole discards a value, but its initializer still runs before the nested read.
// The loop head keeps the leading effect ahead of the extracted method.
export function leading(receiver, effect) {
  for (let [, _ref] = [effect(), receiver], includes = _includes(_ref.w);;) return includes;
}