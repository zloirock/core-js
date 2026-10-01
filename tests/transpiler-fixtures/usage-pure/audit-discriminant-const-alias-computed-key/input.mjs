// a discriminant guard keyed by a const-aliased computed property (`box[K]` with `const K = 'kind'`)
// narrows `box` like the literal `box.kind` / `box['kind']` forms: the field-side key resolves through
// the scope-aware resolver, so inside the guard `box.data` is `number[]` and `.at` narrows to array
type Box = { kind: "a"; data: number[] } | { kind: "b"; data: string };
const K = "kind";
declare const box: Box;
if (box[K] === "a") {
  box.data.at(0);
}
