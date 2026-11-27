import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.string.includes";
// Awaited keeps the receiver selected by the literal argument through a second alias.
type Tag<K> = K extends 'arr' ? Promise<number[]> : Promise<string>;
type AliasTag<K> = Tag<K>;
declare const values: Awaited<AliasTag<'arr'>>;
declare const text: Awaited<AliasTag<'text'>>;
values.at(0);
values.findIndex(x => x > 0);
text.includes('x');
export {};