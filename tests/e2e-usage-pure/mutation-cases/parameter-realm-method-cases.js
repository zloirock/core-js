import { withTemporaryProperty } from '../../helpers/restore-property.cjs';

// The delete belongs to this channel, while foreign setup and cleanup restore exact descriptors.
// eslint-disable-next-line no-unsafe-optional-chaining -- retain the source sealed receiver
export function readParameterRealmMethod({ at } = (globalThis.window?.self).self.box) { return at; }

export function parameterRealmMethodCases() {
  return withTemporaryProperty(globalThis, 'window', globalThis, () => withTemporaryProperty(globalThis, 'self', globalThis,
    () => withTemporaryProperty(globalThis, 'box', [7], () => {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the source delete reads its sealed receiver
      delete (globalThis.window?.self).self.box.at;
      const missing = readParameterRealmMethod().call([7], 0);
      const explicitUndefined = readParameterRealmMethod(undefined).call([7], 0);
      const supplied = readParameterRealmMethod('ab').call('ab', -1);
      function own() { return 9; }
      let gets = 0;
      const custom = readParameterRealmMethod({ get at() {
        gets++;
        return own;
      } });
      const ownUndefined = readParameterRealmMethod({ at: undefined });
      const ownNull = readParameterRealmMethod({ at: null });
      let nullThrows = false;
      try {
        readParameterRealmMethod(null);
      } catch (error) {
        nullThrows = error instanceof TypeError;
      }
      return [missing, explicitUndefined, supplied, custom === own, ownUndefined === undefined, ownNull === null, nullThrows, gets];
    })));
}
