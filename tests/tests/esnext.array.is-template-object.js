QUnit.test('Array.isTemplateObject', assert => {
  const { isTemplateObject } = Array;
  const { freeze } = Object;

  assert.isFunction(isTemplateObject);
  assert.arity(isTemplateObject, 1);
  assert.name(isTemplateObject, 'isTemplateObject');
  assert.looksNative(isTemplateObject);
  assert.nonEnumerable(Array, 'isTemplateObject');

  assert.ok(!isTemplateObject(undefined));
  assert.ok(!isTemplateObject(null));
  assert.ok(!isTemplateObject({}));
  assert.ok(!isTemplateObject(function () {
    return arguments;
  }()));
  assert.ok(!isTemplateObject([]));
  assert.ok(!isTemplateObject(freeze([])));

  const template = (() => {
    try {
      // eslint-disable-next-line no-template-curly-in-string
      return Function('return (it => it)`qwe${ 123 }asd`')();
    } catch { /* empty */ }
  })();

  if (template) assert.ok(isTemplateObject(template));
});
