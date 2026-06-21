// NonNullable<T & {tag}>: TS spec strips null/undefined from each intersection member.
// the plain object literal `{tag: 'a'}` resolves to Object (skipped) while `number[]`
// resolves to Array, so the folded intersection narrows to Array - probe that the
// intersection passes through correctly under the NonNullable wrapper.
type Tagged = (number[] & { tag: 'arr' }) | null;
type Stripped = NonNullable<Tagged>;
declare const v: Stripped;
v.at(0);
v.findLast(x => true);
