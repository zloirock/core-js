// mid-arg comments (between args, not around them) must survive — sliceBetweenParens
// keeps every byte while `code.slice(args[0].start, args.at(-1).end)` did drop them
class X extends Array {
  static of(x, y) { return super.of(x, /* between */ y); }
}
