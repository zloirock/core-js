const fn = () => ['a', 'b'];
class Cls {
  get items() {
    try {
      return fn;
    } catch (e) {
      return fn;
    }
  }
}
new Cls().items().at(0).sub();
