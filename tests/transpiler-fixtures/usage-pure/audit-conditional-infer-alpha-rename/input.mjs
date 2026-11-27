// The inferred tuple head shadows the outer U. Its array supplies the receiver.
type Wrap<T, U> = T extends [infer U, ...any[]] ? U : never;
declare const a: Wrap<[number[], boolean], string>;
a.at(0);
