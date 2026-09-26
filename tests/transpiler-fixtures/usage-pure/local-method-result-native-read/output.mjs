import _Map from "@core-js/pure/actual/map/constructor";
// A native property of the returned constructor requires no additional statics.
// Keep the constructor import narrow when no polyfillable static is read.
const source = {
  read() {
    return _Map;
  }
};
void source.read().prototype;