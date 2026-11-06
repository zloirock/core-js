import _includes from "@core-js/pure/actual/instance/includes";
// A field union keeps its own array and string families through a local assignment.
export function read(flag, write) {
  const box = {
    field: flag ? "x" : ["y"]
  };
  let value = ["z"];
  if (write) value = box.field;
  return _includes(value).call(value, "x");
}