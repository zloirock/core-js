// A conditional value inside a literal object retains its native from read.
// The separate Array.from comparison and push call are independently served.
let pick = 1;
const userObj = {};
const log = [];
{
const { w: { from: f } } = { w: pick ? Array : userObj }; log.push(f === Array.from);
}
