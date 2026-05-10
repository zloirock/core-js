// tuple alias with sibling-position duplicates of an inner param; both slots narrow
// to the substituted shape when the outer alias is instantiated
type Pair<U> = [U, U];
type Box<T> = T[];
type Wrap<T> = Pair<Box<T>>;
declare const x: Wrap<number>;
x[0].at(0);
x[1].flat();
