import _Map from "@core-js/pure/actual/map";
// A computed method key reads the enclosing function's supplied receiver.
// The constructor therefore needs its namespace when passed through the invoker.
function read() {
  return Object.keys({
    [typeof this.groupBy]() {}
  })[0];
}
consume(read.call(_Map));