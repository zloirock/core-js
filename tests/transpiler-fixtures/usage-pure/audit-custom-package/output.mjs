import _Array$from from "my-pure-fork/actual/array/from";
// custom `package` overrides the default `@core-js/pure` - imports re-emit from the
// user's alias. used in monorepos where the canonical pkg is vendored under a new name
_Array$from(x);