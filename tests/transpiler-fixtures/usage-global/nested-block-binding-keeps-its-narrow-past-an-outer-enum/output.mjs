import "core-js/modules/es.array.at";
// The closest declaration determines the receiver, across the surrounding enum scope.
class C {
  static {
    {
      enum s {
        A
      }
      {
        const s = [1];
        s.at(0);
      }
    }
  }
}