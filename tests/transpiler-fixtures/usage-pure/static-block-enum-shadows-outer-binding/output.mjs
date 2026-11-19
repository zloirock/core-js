import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// The closest declaration determines the receiver, across the surrounding enum scope.
class D {
  static {
    const v = [1];
    {
      var _ref;
      enum v {
        A = 'x'
      }
      _includesMaybeString(_ref = v.A).call(_ref, 'x');
    }
  }
}