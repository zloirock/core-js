// A transparent wrapper around a guarded static callee preserves its receiver. Exported readers must also serve unknown callers
// beside the local example calls.
export function viaCast(c) {
  let M: any;
  if (c) ({ Map: M } = globalThis);
  return (M.groupBy as any)([1, 2], x => x % 2);
}
export const r = [viaCast(true)];
