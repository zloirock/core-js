// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
export function* keptGen() {
  let yv;
  yield (yv = globalThis.window)?.[(c++, 'self')].Array.prototype.flatMap.call([2], v => [v]);
}
