// A selected realm remains the source of a loop-head pattern after native relocation.
// Its static and nested instance reads use the same mirror; a supplied object keeps its own values.
export function read(flag, own) {
  for (const { Array: { prototype: { at }, of } } of [flag ? globalThis : own]) {
    return [at.call([3, 7], -1), of(5)];
  }
}
