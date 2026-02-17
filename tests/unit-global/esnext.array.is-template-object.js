QUnit.test('Array.isTemplateObject', assert => {
  const { isTemplateObject } = Array;
  const { freeze } = Object;

  assert.isFunction(isTemplateObject);
  assert.arity(isTemplateObject, 1);
  assert.name(isTemplateObject, 'isTemplateObject');
  assert.looksNative(isTemplateObject);
  assert.nonEnumerable(Array, 'isTemplateObject');

  assert.false(isTemplateObject(undefined));
  assert.false(isTemplateObject(null));
  assert.false(isTemplateObject({}));
  assert.false(isTemplateObject(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()));
  assert.false(isTemplateObject([]));
  assert.false(isTemplateObject(freeze([])), 'frozen string array without .raw should return false #1');
  assert.false(isTemplateObject(freeze(['hello']), 'frozen string array without .raw should return false #2'));

  const template = (() => {
    try {
      // eslint-disable-next-line no-template-curly-in-string -- safe
      return Function('return (it => it)`qwe${ 123 }asd`')();
    } catch { /* empty */ }
  })();

  if (template) assert.true(isTemplateObject(template));
});
