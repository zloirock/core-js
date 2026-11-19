import _includes from "@core-js/pure/actual/instance/includes";
// A realm-looking parameter keeps its own flat receiver.
export function read(window) {
  const includes = _includes(window.list);
  return includes;
}