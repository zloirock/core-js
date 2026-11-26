import "core-js/modules/es.array.at";
type Copy<T> = { [K in keyof T]: T[K] };
declare const copied: Copy<string[]>;
copied.at(0);