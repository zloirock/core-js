let realm;
{
  const globalThis = { Promise: Object };
  realm = globalThis;
}
export const fromRealm = () => realm.Promise.try;
