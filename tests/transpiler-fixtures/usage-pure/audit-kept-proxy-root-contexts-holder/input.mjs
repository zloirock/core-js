// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
export const holder = {
  get val() {
    let gt;
    return (gt = globalThis.window)?.[(c++, 'self')].Array.prototype.map.call([9], v => v);
  },
};
