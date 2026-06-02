// `b` is typed `Base` but is a `Sub` at runtime, and `Sub` declares a member with a DYNAMIC
// computed key `[k]` that could be `items` at runtime, shadowing the inherited array field with a
// string. The shadow can't be ruled out, so the `this.items` narrow bails and `.at` gets generic.
declare const k: string;
class Base { items = [1, 2, 3]; getFirst() { return this.items.at(0); } }
class Sub extends Base { [k] = "shadow"; }
const b: Base = new Sub();
b.getFirst();
