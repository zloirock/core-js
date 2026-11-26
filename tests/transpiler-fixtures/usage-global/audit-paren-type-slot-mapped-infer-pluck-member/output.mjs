import "core-js/modules/es.array.at";
type PluckMember<V> = { [K in 'items' | 'name']: V };
declare const memberPlucked: PluckMember<number[]>;
memberPlucked.items.at(0);