import _Array$of from "@core-js/pure/actual/array/of";
// A local static read after awaited iteration needs its own method, not the Array namespace.
// The constructor stays inside this function; the body never hands it to another consumer.
async function use() {
  let value = Object;
  for await (value of [Array]) {
    break;
  }
  (value === Array ? _Array$of : value.of.bind(value))(3);
}
use();