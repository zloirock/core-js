// `((se(), globalThis) satisfies object)` - TS `satisfies` wrapper around the SE init.
// asserts the TS peel covers BOTH `as` and `satisfies` operators (and `!` non-null) -
// any single-wrapper-type peel would leave the other forms with TS hiding the SE.
for (var { Array: { from } } = ((se(), globalThis) satisfies object); from === undefined; ) break;
export { from };
