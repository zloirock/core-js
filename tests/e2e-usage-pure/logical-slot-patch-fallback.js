// An exported receiver stays open: its missing method can take the source fallback.
export function install(receiver, effects) {
  receiver.at ||= (effects.push('rhs'), () => [7].includes(7));
}

QUnit.test('logical patch: claims inside an executed fallback remain live', assert => {
  const receiver = {};
  const effects = [];
  install(receiver, effects);
  const installed = Object.getOwnPropertyDescriptor(receiver, 'at').value;
  assert.same(installed.call(receiver), true, 'the fallback uses its own polyfill');
  install(receiver, effects);
  assert.deepEqual(effects, ['rhs'], 'a filled slot does not evaluate the fallback again');
});
