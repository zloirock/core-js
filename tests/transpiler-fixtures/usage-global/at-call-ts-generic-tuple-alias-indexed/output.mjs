import "core-js/modules/es.string.at";
type Pair<T> = [T, T];
declare const p: Pair<string>[0];
p.at(-1);