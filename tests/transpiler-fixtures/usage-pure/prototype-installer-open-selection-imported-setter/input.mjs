// A guard over the installer owners preserves the prototype install for later receiver typing.
// Selecting the owners or the setter functions themselves yields the same dispatch family.
const owners = {};
(c ? Object : Reflect).setPrototypeOf(owners, Array.prototype);
export const a = owners.at(-1);
const setters = {};
(c ? Object.setPrototypeOf : Reflect.setPrototypeOf)(setters, Array.prototype);
export const b = setters.findLast(f);
