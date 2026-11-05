// A guard carries the prototype install into its rendered branches. Both an early closure
// query and a later receiver query retain that source fact; query order cannot erase the install.
const owners = {};
export const early = () => owners.findLast(f);
(c ? Object : Reflect).setPrototypeOf(owners, Array.prototype);
export const late = owners.at(-1);
