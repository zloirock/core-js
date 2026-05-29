// rest destructured into an object pattern (`[...{ length }]`) binds `length` to the rest
// Array's own length (a number), not to the Array itself - so `.at` must stay generic
// (Array|String) instead of mis-narrowing to Array-only off the discarded inner path
const [...{ length }] = arr;
length.at(-1);
