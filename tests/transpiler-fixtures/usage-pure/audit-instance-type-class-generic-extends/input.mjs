// InstanceType<typeof Bag> for `class Bag<T> extends Array<T>`. The class's own type
// parameter must not break inheritance resolution: instances still resolve to Array, so
// `.at(0)` and `.findLast(...)` narrow to the Array variants.
class Bag<T> extends Array<T> {}
declare const inst: InstanceType<typeof Bag>;
inst.at(0);
inst.findLast(x => true);
