import _Array$from from "@core-js/pure/actual/array/from";
// super.static(args) replacement must preserve leading/trailing/mid-arg comments -
// previously `code.slice(args[0].start, args.at(-1).end)` dropped comments outside the arg range
class X extends Array {
  static make() {
    return _Array$from.call(this, /* pre */[1, 2] /* post */);
  }
}