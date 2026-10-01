import _Array$from from "@core-js/pure/actual/array/from";
// `((se(), globalThis) satisfies object)` - TS `satisfies` wrapper around the SE init.
// asserts the TS peel covers BOTH `as` and `satisfies` operators (and `!` non-null) -
// any single-wrapper-type peel would leave the other forms with TS hiding the SE.
for (var {
  Array: {
    from
  }
} = (se(), {
  Array: {
    from: _Array$from
  }
}) satisfies object; from === undefined;) break;
export { from };