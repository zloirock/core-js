import "core-js/modules/es.string.includes";
// The closest declaration determines the receiver, across the surrounding enum scope.
class D {
  static {
    const v = [1];
    {
      enum v {
        A = 'x'
      }
      v.A.includes('x');
    }
  }
}