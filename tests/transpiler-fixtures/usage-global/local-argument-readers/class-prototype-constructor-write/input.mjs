// Returning an empty class prototype exposes its constructor and writable static fields.
function pick(o) {
  return o.prototype;
}
class Box {
  static rows = [8, 9];
}
const held: any = pick(Box);
held.constructor.rows = "ab";
use(Box.rows.at(-1));
