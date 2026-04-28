import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// SFC frameworks (Vue / Svelte / Astro) emit virtual module ids like
// `Component.vue?vue&type=script&lang=ts` for the script block. without the lang-suffix
// rewrite, oxc-parser sees the post-strip id `Component.vue` (unknown extension), defaults
// to plain JS, and silently rejects TS syntax like `as` / type annotations - polyfill
// emit then short-circuits. detection lifts `lang=tsx?` / `lang=jsx?` from the original
// query and synthesizes a matching extension hint so oxc enables the right parser
const x = 1 as number;
_flatMaybeArray(arr)?.call(arr);