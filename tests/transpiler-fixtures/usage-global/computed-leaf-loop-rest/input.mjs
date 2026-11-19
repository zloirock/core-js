// A nested computed method with a default needs capture in the loop body.
// Each iteration keeps its own method and rest, with one getter read per element.
const leaf = [5, 6];
for (const { data: { [(key(), 'at')]: method = fallback(), ...rest } } of [{ get data() { log(); return leaf; } }]) {
  use(method.call(leaf, -1), rest);
}
