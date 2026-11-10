// A key declared in this static block names the string-valued slot.
class Box {
  static {
    const key = 'name';
    const { [key]: value } = { name: 'alice' };
    value.at(-1);
  }
}
