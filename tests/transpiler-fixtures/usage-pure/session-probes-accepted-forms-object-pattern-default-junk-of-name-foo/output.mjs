import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
{
  const {
    junk: defaultJunk,
    of: {
      name: defaultName,
      foo: defaultFoo
    } = {}
  } = {
    junk: Array.junk,
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    }
  };
  [defaultJunk, defaultName, defaultFoo];
}