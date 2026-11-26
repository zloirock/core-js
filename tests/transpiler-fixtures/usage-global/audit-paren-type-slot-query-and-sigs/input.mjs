declare function f(): string[];
type R = ReturnType<(typeof f)>;
declare const ret: R;
ret.at(0);
