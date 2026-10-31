// an enum between a read and the binding the read resolves to shadows that binding, while one further out than
// the binding does not: a declaration in a block nested in a class static block or a namespace body is scoped by
// that nested block, even though the scope tracker files what the static block or namespace body itself declares
// on a scope further out. the first three lines keep their narrow past such an enum; on the last the enum really
// stands between the read and the outer constant, so its own member type decides. one family per line so a lost
// decision shows up in the import set.
class C { static { { enum s { A } { const s = [1]; s.at(0); } } } }
namespace N { { enum t { A } { const t = 'ab'; t.includes('a'); } } }
namespace Outer { enum u { A } namespace Inner { const u = [1]; u.at(0); } }
class D { static { const v = [1]; { enum v { A = 'x' } v.A.includes('x'); } } }
