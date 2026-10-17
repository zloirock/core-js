const slots = [WeakMap];
slots[0] = null;
const [W] = slots;
export const owns = (typeof W == 'function' ? W : Object).hasOwn;
