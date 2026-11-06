import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref, _unused;
// A member target a TS assertion wraps whole spells the slot inside it: a static, an instance claim and a
// nested instance claim write the ponyfill into it in both emitters, the assertion kept around the write;
// beside a rest one level down the hop capture writes it ahead of the rest copy. A computed one beside a
// binding sibling keeps their write order through the same mirror as its bare twin.
const sink: any = {};
let v, rest;
(sink.f as any) = _Array$from;
sink.g! = _Array$of;
(sink.m as any) = _at(arr);
sink.n! = _flatMaybeArray(arr);
({
  entries: sink[k()] as any,
  values: v
} = {
  entries: _Object$entries,
  values: _Object$values
});
({
  Array: _ref
} = _globalThis);
(sink.r as any) = _Array$fromAsync, {
  fromAsync: _unused,
  ...rest
} = _ref;