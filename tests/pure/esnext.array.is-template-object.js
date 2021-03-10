import isTemplateObject from 'core-js-pure/full/array/is-template-object';
import freeze from 'core-js-pure/full/object/freeze';

QUnit.test('Array.isTemplateObject', assert => {
  assert.isFunction(isTemplateObject);
  assert.arity(isTemplateObject, 1);
  assert.name(isTemplateObject, 'isTemplateObject');

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
      // eslint-disable-next-line no-template-curly-in-string -- ignore
      return Function('return (it => it)`qwe${ 123 }asd`')();
    } catch { /* empty */ }
  })();

  if (template) assert.ok(isTemplateObject(template));
});
