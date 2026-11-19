// A conditional constructor and a realm neighbour retain their native array-pattern reads.
// The later static comparison, push call and realm reference are independently served.
let pick = 1;
const userObj = {};
const log = [];
{
const [{ from: f }, { Map: M }] = [pick ? Array : userObj, globalThis]; log.push(f === Array.from, typeof M);
}
