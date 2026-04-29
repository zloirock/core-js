// SFC frameworks (Vue / Svelte / Astro) emit virtual module ids like
// `Component.vue?vue&type=script&lang=ts` for the script block. Detection lifts
// `lang=ts/tsx/jsx` from the original query and synthesizes a matching extension hint
// so the parser enables the right mode. The post-strip id `Component.vue` would default
// to plain JS, so the lang-suffix lift is what keeps TS syntax (`as` / type annotations)
// parsing and the polyfill emit reaching usage detection
const x = 1 as number;
arr.flat?.();
