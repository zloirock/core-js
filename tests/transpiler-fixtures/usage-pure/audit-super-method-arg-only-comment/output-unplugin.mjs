import _Array$from from "@core-js/pure/actual/array/from";
// only-comment argslist — sliceBetweenParens returns the comment, `sep = ''` because
// `arguments.length === 0`, so there's no dangling leading comma before the comment
class X extends Array {
  static make() { return _Array$from.call(this/* only */); }
}