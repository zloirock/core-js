import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// SFC frameworks (Vue / Svelte / Astro) emit virtual ids like
// `Component.vue?vue&type=script&lang=ts`. the `lang=ts/tsx/jsx` query must be lifted into
// an extension hint so the parser picks the right mode; the post-strip id `Component.vue`
// would default to plain JS and break TS syntax (`as` / annotations), starving usage detection.
const x = 1 as number;
_flatMaybeArray(arr)?.call(arr);