import _Array$from from "@core-js/pure/actual/array/from";
// an arrow IIFE call argument has a trailing comma; the receiver-substitution must preserve it untouched.
(({ from }) => from(1))({ from: _Array$from },);