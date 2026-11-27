import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Awaited keeps the receiver selected by the literal argument through a second alias.
type Tag<K> = K extends 'arr' ? Promise<number[]> : Promise<string>;
type AliasTag<K> = Tag<K>;
declare const values: Awaited<AliasTag<'arr'>>;
declare const text: Awaited<AliasTag<'text'>>;
_atMaybeArray(values).call(values, 0);
_findIndexMaybeArray(values).call(values, x => x > 0);
_includesMaybeString(text).call(text, 'x');
export {};