import invoke from '@core-js/pure/actual/reflect/apply';

// eslint-disable-next-line no-void -- retain the import beside the intentionally shadowed call
void invoke;
QUnit.test('mutation channel: local invoker shadow keeps the global pristine', assert => {
  function pick(value) { return value; }
  // eslint-disable-next-line no-shadow -- the local binding must hide the imported invoker
  function invoke() { return {}; }
  // eslint-disable-next-line sonarjs/no-extra-arguments -- match Reflect.apply while calling the local binding
  invoke(pick, null, [Array]).from = () => 'local';
  assert.same(Array.from([7])[0], 7);
});
