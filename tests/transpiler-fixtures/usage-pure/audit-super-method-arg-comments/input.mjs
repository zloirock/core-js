// super.static(args) replacement must preserve leading/trailing/mid-arg comments -
// previously `code.slice(args[0].start, args.at(-1).end)` dropped comments outside the arg range
class X extends Array {
  static make() {
    return super.from(/* pre */ [1, 2] /* post */);
  }
}
