import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _replaceAllMaybeString from "@core-js/pure/actual/string/instance/replace-all";
// Vue SFC virtual id with the DOTTED `lang.ts` form (`...?vue&type=script&setup=true&lang.ts`) that
// Vite's vue plugin emits - the block lang is a trailing dotted suffix (URLSearchParams key `lang.ts`),
// NOT a `lang=` value. it must be lifted onto a `.ts` extension so oxc parses the TS body (`as` /
// annotations); the bare `.vue` id would default to plain JS and reject the TS syntax, starving usage
// detection of the polyfillable method. each line uses a distinct method to keep dispatch identifiable
const x = 1 as number;
_findLastMaybeArray(arr).call(arr, y => y);
_replaceAllMaybeString(str).call(str, 'a', 'b');