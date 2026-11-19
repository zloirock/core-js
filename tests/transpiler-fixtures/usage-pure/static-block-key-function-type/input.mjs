// A local function returning a key keeps the literal's field precise.
class Box {
  static {
    function key() { return 'name'; }
    const object = { [key()]: 'alice' };
    object.name.at(-1);
  }
}
