import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// a readonly collection is not assignable to its mutable form, and a homomorphic readonly
// mapped type is the very type `Readonly<>` spells - both take the FALSE branch. `-readonly`
// removes the view again, so it takes the true one
type IsMutable<T> = T extends number[] ? number[] : string;
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
declare const viaMapped: IsMutable<MyReadonly<number[]>>;
declare const viaMutable: IsMutable<Mutable<Readonly<number[]>>>;
viaMapped.includes('a');
viaMutable.at(0);