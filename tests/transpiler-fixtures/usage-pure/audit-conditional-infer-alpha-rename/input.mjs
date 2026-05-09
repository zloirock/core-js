// `infer U` shadows outer `U` in trueType per TS spec - outer `string` must NOT
// leak in. `Wrap<[number[], boolean], string>` has tuple-head infer competing with
// outer `U=string`; correct evaluation keeps inferred binding so `a.at` dispatches
// generically (string-narrow leak would emit a String polyfill instead)
type Wrap<T, U> = T extends [infer U, ...any[]] ? U : never;
declare const a: Wrap<[number[], boolean], string>;
a.at(0);
