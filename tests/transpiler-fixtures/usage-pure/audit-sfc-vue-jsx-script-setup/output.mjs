import _at from "@core-js/pure/actual/instance/at";
// SFC virtual id with both `lang=tsx` (JSX-in-TS) and Vue's setup script. The `.tsx`
// hint must be lifted from the query so the parser handles TypeScript alongside JSX,
// even when several tokens (vue, type, setup, lang) sit before the closing extension.
const x = 1 as number;
const Comp = () => <div>{_at(arr)?.call(arr, -1)}</div>;