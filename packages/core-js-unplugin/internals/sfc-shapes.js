import { stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';

// SFC (Vue / Svelte / Astro) virtual module ids carry the parser-language hint inside the
// query (`App.vue?vue&type=script&lang=ts`). these shared regexes are consumed by
// `shouldTransform` (admit gate) and `liftSfcLangSuffix` (parser-id rewrite) so admission
// and parser-language inference agree byte-for-byte. `/i` flag everywhere - some pipelines
// preserve author-cased `<script lang="TS">` instead of canonical lowercase.

// SFC framework alphabet - shared with snapshot-cache's marker scan
export const SFC_FRAMEWORK_GROUP = '(?:astro|svelte|vue)';

// named `ext` group lets callers extract the matched alphabet without re-parsing. boundary
// `(?:[#&]|$)` accepts `#hash` terminator (sourcemap pipelines append `#L<line>`).
// declaration-block `lang=d.ts` cannot match - alternation demands `[jt]` which `d.ts` lacks
export const SFC_LANG_RE = /[&?]lang=(?<ext>[cm]?[jt]sx?)(?:[#&]|$)/i;

// SFC sub-blocks without an explicit `lang=` token are JS by default
export const SFC_DEFAULT_JS_RE = new RegExp(`[&?]${ SFC_FRAMEWORK_GROUP }&type=(?:module|script)(?:[#&]|$)`, 'i');

// non-JS sub-blocks: `<style lang="ts">` / `<template lang="ts">` bodies are CSS/markup,
// not runnable JS. SFC_LANG_RE alone would accept them; this gate keeps polyfill injection off
export const SFC_NON_JS_TYPE_RE = /[&?]type=(?:style|template)(?:[#&]|$)/i;

// lift the SFC `lang=` hint onto the post-strip id so oxc-parser's extension-based parser
// inference sees the right language. without the lift, `App.vue?vue&type=script&lang=ts`
// strips to `App.vue` and oxc defaults to plain JS on the unknown `.vue` extension - TS
// syntax in the script block is then silently rejected. extension is lowercased so the
// synthesized suffix stays canonical regardless of the author's casing (`lang=TS` -> `.ts`)
export function liftSfcLangSuffix(id) {
  const baseId = stripQueryHash(id);
  const ext = SFC_LANG_RE.exec(id)?.groups?.ext;
  return ext ? `${ baseId }.${ ext.toLowerCase() }` : baseId;
}
