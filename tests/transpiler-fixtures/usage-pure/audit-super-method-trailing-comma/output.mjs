import _Array$from from "@core-js/pure/actual/array/from";
// trailing comma in super.static argslist - sliceBetweenParens keeps every byte between
// parens, so the trailing comma survives; old `code.slice(args[0].start, args.at(-1).end)`
// would have dropped it
class X extends Array {
  static make() {
    return _Array$from.call(this, [1, 2]);
  }
}