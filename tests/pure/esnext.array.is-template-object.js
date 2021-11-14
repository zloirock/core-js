import freeze from 'core-js-pure/es/object/freeze';
import isTemplateObject from 'core-js-pure/features/array/is-template-object';

QUnit.test('Array.isTemplateObject', assert => {
  assert.isFunction(isTemplateObject);
  assert.arity(isTemplateObject, 1);
  assert.name(isTemplateObject, 'isTemplateObject');

  assert.false(isTemplateObject(undefined));
  assert.false(isTemplateObject(null));
  assert.false(isTemplateObject({}));
  assert.false(isTemplateObject(function () {
    return arguments;
  }()));
  assert.false(isTemplateObject([]));
  assert.false(isTemplateObject(freeze([])));

  const template = (() => {
    try {
      // eslint-disable-next-line no-template-curly-in-string -- ignore
      return Function('return (it => it)`qwe${ 123 }asd`')();
    } catch { /* empty */ }
  })();

  if (template) assert.true(isTemplateObject(template));
});
