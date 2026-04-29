import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Svelte SFC virtual id with `lang=tsx` exercises the `tsx` branch of the SFC lang lift -
// regex captures `lang=(t)(sx)` -> `.tsx` extension hint for oxc, enabling combined TS +
// JSX parsing in the script block. without the lift, oxc on `App.svelte` rejects both
// `as` casts AND JSX expressions silently
const x = 1 as number;
const el = <div>{_flatMaybeArray(arr)?.call(arr)}</div>;
_at(arr).call(arr, 0);