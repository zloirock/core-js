// a class evaluates its own decorator list and its heritage at definition time, and the two
// implementations rank that pair the other way round from each other: the spec evaluates the
// decorator list before the heritage, every downlevel lowering hoists the `extends` expression ahead
// of the static block it applies the decorators in. neither slot ranks the other, so the write in
// the heritage reaches the read standing above it in the decorator and both families inject
let v = [7, 8, 9];

@((v.at(0)), c => c)
class C extends ((v = 'abc'), Object) {}

new C();
