// a discriminant guard keyed by an ENUM-member computed property (`box[Keys.Kind]`) narrows like the
// literal form: the field-side key resolves through the enum-member branch of computed-key name
// resolution, so inside the guard `box.data` is `number[]` and `.at` narrows to the array variant
// (distinct from the const-string-alias computed-key fixture)
enum Keys { Kind = "kind" }
type Box = { kind: "a"; data: number[] } | { kind: "b"; data: string };
declare const box: Box;
if (box[Keys.Kind] === "a") {
  box.data.at(0);
}
