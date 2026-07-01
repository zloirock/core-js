// Extract<U, T> where U has a `never` member: never absorbs in TS unions ('a' | never = 'a'),
// but the AST may carry `never` literally. the Extract/Exclude resolution iterates union members and
// resolves each. For TSNeverKeyword, the type-annotation resolution returns
// $Primitive('never'). Probe that never-member does not interfere with sibling assignability:
// number[] member should match the target.
type Pool = number[] | never;
type Filtered = Extract<Pool, number[]>;
declare const arr: Filtered;
arr.at(0);
arr.findLast(x => true);
