// a DELETED constructor slot is a replacement too: a construction and a computed-key read follow the
// now-empty slot instead of binding the module-cached ponyfill
delete globalThis.Iterator;
export const i2 = new Iterator();
export const cd = Iterator['from'];
