import _Map from "@core-js/pure/actual/map";
// A known synchronous call replaces this own slot before its later destructuring read.
// The original Object candidate is dead; pure retains Map with its statics and the actual read.
function install(value) {
  if (value) value.k = _Map;
}
const source = {
  k: Object
};
install(source);
export const {
  k: {
    groupBy
  }
} = source;