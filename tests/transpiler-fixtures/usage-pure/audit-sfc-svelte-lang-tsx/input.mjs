// Svelte SFC virtual id with `lang=tsx` exercises the `tsx` branch of the SFC lang lift -
// regex captures `lang=(t)(sx)` -> `.tsx` extension hint for oxc, enabling combined TS +
// JSX parsing in the script block. without the lift, oxc on `App.svelte` rejects both
// `as` casts AND JSX expressions silently
const x = 1 as number;
const el = <div>{arr.flat?.()}</div>;
arr.at(0);
