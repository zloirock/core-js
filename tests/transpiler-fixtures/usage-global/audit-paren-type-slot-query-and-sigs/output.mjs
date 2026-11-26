import "core-js/modules/es.array.at";
declare function f(): string[];
type R = ReturnType<typeof f>;
declare const ret: R;
ret.at(0);