// A static-only conditional element keeps both native from and at reads.
// The separate Array.from comparison and push call are still served.
let pick = 1;
const userObj = {};
const log = [];
{
const [{ from: f, at: a }] = [pick ? Array : userObj]; log.push(f === Array.from, typeof a);
}
