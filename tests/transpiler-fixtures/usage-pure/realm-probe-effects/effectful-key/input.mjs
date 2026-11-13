// A key with effects stays live and runs once.
const effects = [];
export function read() {
  function key() { effects.push("key");
  return "self";
  } return globalThis[key()].Math.abs(-3);
}
