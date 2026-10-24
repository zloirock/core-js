let realm;
{
  const globalThis = { Array: Object };
  realm = globalThis;
}
export const fromRealm = () => realm.Array.from;
