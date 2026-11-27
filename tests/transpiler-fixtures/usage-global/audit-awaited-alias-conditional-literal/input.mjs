// Awaited keeps the receiver selected by the literal argument through a second alias.
type Tag<K> = K extends 'arr' ? Promise<number[]> : Promise<string>;
type AliasTag<K> = Tag<K>;
declare const values: Awaited<AliasTag<'arr'>>;
declare const text: Awaited<AliasTag<'text'>>;
values.at(0);
values.findIndex(x => x > 0);
text.includes('x');
export {};
