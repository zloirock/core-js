// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
export async function awaited() {
  let aw;
  return (aw = await Promise.resolve(globalThis.window))?.[(c++, 'self')]?.Array ?? null;
}
