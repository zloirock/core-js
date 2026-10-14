// A realm selection destructured beside a key the author opts out of, as a parameter default and assigned:
// unplugin mirrors the realm arm, serving the other keys and reading the opted-out one off the realm (the
// sidecar), while babel keeps the whole selection native - its debt.
import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";

export function opt(
	{
		Array: {
			from: fr,
			// core-js-disable-next-line
			of
		}
	} = c
		? { Array: { from: _Array$from, of: _globalThis.Array.of } }
		: fb
) {
	return [fr, of];
}

let fe, oe;

({
	Object: {
		fromEntries: fe,
		// core-js-disable-next-line
		entries: oe
	}
} = c
	? {
		Object: {
			fromEntries: _Object$fromEntries,
			entries: _globalThis.Object.entries
		}
	}
	: fb);