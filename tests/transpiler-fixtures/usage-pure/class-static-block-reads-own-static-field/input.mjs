// a static block and a later static field read a static DATA field of their own class through the
// class name: the class-scope binding is initialized before any static element runs, and the field
// evaluates before the reader - so the read resolves; a block standing BEFORE the field, or one that
// reassigns it, reads what the source reads there
class Holder {
  static M = Map;
  static { use(Holder.M.groupBy); }
  static A = Array;
  static G = Holder.A.from;
}
class Early {
  static { use(Early.P?.try); }
  static P = Promise;
}
class Swapped {
  static O = Object;
  static { Swapped.O = Set; use(Swapped.O.fromEntries); }
}
