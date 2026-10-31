// `Box[keyof Box]` folds the union of every member VALUE type; a class getter carries its value
// type on the accessor's return, which some parsers nest under the member's `value`. reading all
// three member-value shapes keeps the getter in the union so `number[]` survives and the receiver
// resolves array-specific, instead of the whole value-union bailing to the generic instance helper
class Box {
  get data(): number[] { return []; }
  items: number[] = [];
}
declare const v: Box[keyof Box];
export const r = v.at(0);
