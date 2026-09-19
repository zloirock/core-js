// literal-init presence drives the defaulted-binding type: a plain value kills the default
// (member-only), a literal undefined fires it (default-only), and an accessor / method match
// stays undecided - the member x default fold keeps both sides (a false 'absent' narrowed a
// getter-supplied array to the default's string flavor)
const { p = '' } = { p: [1] };
p.at(0);
const { u = 'x' } = { u: undefined };
u.at(0);
const { g = '' } = { get g() { return [2]; } };
g.at(1);
