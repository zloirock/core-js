import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Awaited<Required<Promise<X>>>: a value-transparent wrapper (Required) around the Awaited
// arg must be peeled before the Promise unwrap so the awaited inner type surfaces. any wrapper
// transparent at value level must not shadow Awaited's deeper Promise inner
declare const p: Awaited<Required<Promise<number[]>>>;
_includesMaybeArray(p).call(p, 1);