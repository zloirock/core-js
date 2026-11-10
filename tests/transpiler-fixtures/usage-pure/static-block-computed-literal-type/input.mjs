// The key is resolved where the literal is built.
class Box {
  static {
    const key = 'name';
    const object = { [key]: 'alice' };
    { const key = 'other'; object.name.at(-1); }
  }
}
