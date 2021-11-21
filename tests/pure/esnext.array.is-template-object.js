import isTemplateObject from 'core-js-pure/features/array/is-template-object';
import freeze from 'core-js-pure/features/object/freeze';

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
