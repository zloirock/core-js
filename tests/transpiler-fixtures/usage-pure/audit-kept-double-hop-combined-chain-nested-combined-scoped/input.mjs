// inside a FUNCTION scope the dead root memo prunes too: the scoped `var` list drops the
// excised name on both emitters (the flush declaration does not exist there)
export const nestedCombinedScoped = () => {
  let w3;
  return (w3 = globalThis.window)?.self.Array.of(7).flat?.().map?.(x => x).at?.(0);
};
