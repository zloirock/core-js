import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// `this.items` is typed by the merged interface (number[] -> array .at), but a subclass
// shadows `items` with `any`, so an inherited `read` running on a Sub instance can see a
// string. The via-`this` narrow off the merged-interface declaration is unsound: it must
// widen and emit BOTH es.array.at and es.string.at, not array-only.
class Base {
  read() {
    return this.items.at(-1);
  }
}
interface Base {
  items: number[];
}
class Sub extends Base {
  items: any = 'x';
}
declare const s: Sub;
s.read();