import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// `((se(), globalThis) satisfies object)` - TS `satisfies` wrapper around the SE init.
// asserts the TS peel covers BOTH `as` and `satisfies` operators (and `!` non-null) -
// any single-wrapper-type peel would leave the other forms with TS hiding the SE.
for (var from = _Array$from, _unused = (se(), _globalThis); from === undefined; ) break;
export { from };
