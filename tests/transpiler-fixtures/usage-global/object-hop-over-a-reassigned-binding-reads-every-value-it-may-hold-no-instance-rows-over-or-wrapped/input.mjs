let orRealm = globalThis;
orRealm = window || globalThis;
const [{ with: noInstanceRowsOverOrWrapped }] = [orRealm];
export default [noInstanceRowsOverOrWrapped];
