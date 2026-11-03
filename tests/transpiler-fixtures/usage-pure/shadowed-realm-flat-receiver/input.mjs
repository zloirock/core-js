// A realm-looking parameter keeps its own flat receiver.
export function read(window) {
  const { includes } = window.list;
  return includes;
}
