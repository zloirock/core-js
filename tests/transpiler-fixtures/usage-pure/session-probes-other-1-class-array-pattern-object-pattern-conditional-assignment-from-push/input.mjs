// A class static block keeps its native conditional array-pattern read.
// The later Array.from comparison and push call retain their independent polyfills.
let pick = 1;
const userObj = {};
const log = [];
{
class C5 { static { const [{ from: f }] = [pick ? Array : userObj]; C5.f = f; } } log.push(C5.f === Array.from);
}
