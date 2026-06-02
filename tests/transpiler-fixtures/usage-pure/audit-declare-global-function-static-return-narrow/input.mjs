// an ambient FUNCTION declared inside `declare global { ... }` (parsed as TSDeclareFunction) must be
// found by the global-augmentation descent too: its return (`gfn<string>()` -> `string[]`) narrows
// `.at` to the array variant. complements the in-global class case (different matcher path)
declare global {
  function gfn<T>(): T[];
}
gfn<string>().at(0);
