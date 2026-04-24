// trailing comma in super.static argslist - sliceBetweenParens keeps every byte between
// parens, so the trailing comma survives; old `code.slice(args[0].start, args.at(-1).end)`
// would have dropped it
class X extends Array {
  static make() { return super.from([1, 2],); }
}
