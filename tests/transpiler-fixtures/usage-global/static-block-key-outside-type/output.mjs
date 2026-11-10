import "core-js/modules/es.string.at";
// A static block's key must not shadow the later outside read.
const key = 'name';
class Box {
  static {
    const key = 'other';
  }
}
const object = {
  [key]: 'alice',
  other: []
};
object.name.at(-1);