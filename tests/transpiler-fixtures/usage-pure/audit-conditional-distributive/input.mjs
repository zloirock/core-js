// distributive conditional: when T is a union, T extends X ? A : B distributes per-member.
// current resolveConditionalBranches doesn't distribute - just merges trueType/falseType
// globally. expected: 'string' | 'number'[] depending on member. plugin bails or merges incorrectly.
type Wrap<T> = T extends string ? T : T[];
declare const w: Wrap<string | number>;
w.at ? w.at(0) : w;
