import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Svelte SFC virtual id with `lang=tsx` exercises the `tsx` branch of the SFC lang-suffix
// lift - the `lang` query value is mapped to a synthetic `.tsx` extension hint, enabling
// combined TS + JSX parsing in the script block so `as` casts AND JSX expressions are
// accepted on `App.svelte`
const x = 1 as number;
const el = <div>{_flatMaybeArray(arr)?.call(arr)}</div>;
_at(arr).call(arr, 0);