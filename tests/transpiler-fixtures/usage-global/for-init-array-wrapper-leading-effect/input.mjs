// A leading hole discards a value, but its initializer still runs before the nested read.
// The loop head keeps the leading effect ahead of the extracted method.
export function leading(receiver, effect) {
  for (let [, { w: { includes } }] = [effect(), receiver]; ;) return includes;
}
