// Different calls can return different receivers for the same nested loop slot.
// Each call runs once; a guarded static keeps the custom receiver and per-iteration binding.
function first() { log(1); return Array; }
function second() { log(2); return { from: custom }; }
for (const { w: { from } } of [{ w: first() }, { w: second() }]) {
  use(from([7]), () => from([8]));
}
