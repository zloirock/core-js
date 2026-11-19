import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The closest declaration determines the receiver, across the surrounding enum scope.
class C {
  static {
    {
      enum s {
        A
      }
      {
        const s = [1];
        _atMaybeArray(s).call(s, 0);
      }
    }
  }
}