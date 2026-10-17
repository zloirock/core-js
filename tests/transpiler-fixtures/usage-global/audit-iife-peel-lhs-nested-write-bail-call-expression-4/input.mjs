const dict = {};
const okKeyRead = (arg => {
  dict[String(arg.name)] = 2;
  return arg;
})(Reflect);
const { ownKeys: ok } = okKeyRead;
export const r5 = ok({ a: 1 });
