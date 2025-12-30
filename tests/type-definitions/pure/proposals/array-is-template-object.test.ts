import arrayIsTemplateObject from '@core-js/pure/full/array/is-template-object';
import objectFreeze from '@core-js/pure/full/object/freeze';
import $Symbol from '@core-js/pure/full/symbol/index';

const t: boolean = arrayIsTemplateObject([]);
arrayIsTemplateObject({});
arrayIsTemplateObject(['a', 'b']);
arrayIsTemplateObject(objectFreeze(['foo', 'bar']));
arrayIsTemplateObject(123);
arrayIsTemplateObject('str');
arrayIsTemplateObject($Symbol());

declare const x: unknown;
if (arrayIsTemplateObject(x)) {
  x.raw;
  const _: readonly string[] = x.raw;
}
