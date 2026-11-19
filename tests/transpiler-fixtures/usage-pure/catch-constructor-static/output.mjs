import _Promise from "@core-js/pure/actual/promise";
// The catch pattern reads a static from the thrown constructor.
try {
  throw _Promise;
} catch ({
  resolve
}) {
  use(resolve);
}