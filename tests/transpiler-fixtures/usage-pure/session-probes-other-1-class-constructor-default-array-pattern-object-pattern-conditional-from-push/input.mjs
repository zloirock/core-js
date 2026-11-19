// A constructor's array default keeps its native supplied/defaulted from reads.
// The later Array.from comparison and push call are independently served.
let pick = 1;
const userObj = {};
const log = [];
{
class C1 { constructor([{ from: f }] = [pick ? Array : userObj]) { this.f = f; } } log.push(new C1().f === Array.from, new C1([userObj]).f());
}
