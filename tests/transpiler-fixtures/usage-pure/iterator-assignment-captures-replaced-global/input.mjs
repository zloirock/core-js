// expose installs the array as window in the test realm.
export function first(expose, fallback) {
  expose([3]);
  let method;
  const rows = ({ [(expose([9]), Symbol.iterator)]: method = fallback() } = window);
  return method.call(rows).next().value;
}
