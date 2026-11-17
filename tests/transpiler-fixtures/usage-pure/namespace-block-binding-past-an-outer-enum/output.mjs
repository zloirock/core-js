import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// The closest declaration determines the receiver, across the surrounding enum scope.
namespace N {
  {
    enum t {
      A
    }
    {
      const t = 'ab';
      _includesMaybeString(t).call(t, 'a');
    }
  }
}