// A local reader returning the class prototype still exposes methods to foreign receivers.
function pick(o) {
  return o.prototype;
}
class Box {
  data = [8, 9];
  read() {
    return this.data.at(-1);
  }
}
const held = pick(Box);
use(held.read.call({ data: "ab" }));
