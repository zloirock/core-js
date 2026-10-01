declare const cond: boolean;
class Box {
  get data() {
    if (cond) return [1, 2, 3];
    return 'hello';
  }
}
new Box().data.at(-1);
