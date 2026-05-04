// NonNullable<T['k']> applied to a renamed-mapped member. expandMappedTypeMembers
// must surface a member whose annotation is then peeled by NonNullable.
type Source = { items: number[] | null };
type Renamed<T> = { [K in keyof T as `_${K & string}`]: T[K] };
type Member = NonNullable<Renamed<Source>['_items']>;
declare const m: Member;
m.includes(1);
