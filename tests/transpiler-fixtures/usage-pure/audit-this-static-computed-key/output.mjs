import _Array$from from "@core-js/pure/actual/array/from";
// `this[KEY](...)` in a static method, where `KEY` is a const-bound string folding to
// 'from'. dispatch must follow the alias AND retarget through the `Array` superclass
// (`extends Array`) so the call emits the inherited static polyfill
class Child extends Array<number> {
  static probe(xs: Iterable<number>) {
    const KEY = 'from';
    return _Array$from.call(this, xs);
  }
}
Child.probe([1, 2, 3]);