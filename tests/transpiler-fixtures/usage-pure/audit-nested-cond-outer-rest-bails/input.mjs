// the user-object branch has no `Array.from`; an OUTER rest can't be mirrored either, so the same
// bail applies - a per-branch default would corrupt the user branch's legitimate undefined, so the
// receiver stays native instead
const userObj = { Array: {} };
let useGlobal = false;
const { Array: { from }, ...rest } = useGlobal ? globalThis : userObj;
typeof from;
