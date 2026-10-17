import _Promise from "@core-js/pure/actual/promise";
// a logical assign is a write like any other for the bail
const cl = {
  q: Object
};
cl.q ||= _Promise;
const {
  q: {
    try: viaLogicalAssign
  }
} = cl;
export { viaLogicalAssign };