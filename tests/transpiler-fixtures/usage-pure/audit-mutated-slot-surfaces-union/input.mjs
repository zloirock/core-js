// a bound local of the same name is an ordinary variable - reads stay on the local
let Set = localShim;
Set = other;
use(Set.union(z));
