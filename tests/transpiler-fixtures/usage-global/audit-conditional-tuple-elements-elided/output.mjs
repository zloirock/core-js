import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Tuple elements that do not fold to one type are dropped, so the check cannot be decided and BOTH
// branches' families are injected - two modules where a decided check leaves one (`Array<number>
// extends Array<string>` keeps `es.string.at` alone). The element ORDER is inert here: identical
// tuples answer the same two modules.
type Sel<T> = T extends Array<[string, number]> ? number[] : string;
declare const v: Array<[number, string]>;
declare const r: Sel<typeof v>;
r.at(0);