import 'core-js/full';
import isTemplateObject from 'core-js/full/array/is-template-object';
import { assertBool } from '../../helpers';

const res: boolean = isTemplateObject([]);

// @ts-expect-error
isTemplateObject();

assertBool(Array.isTemplateObject([]));
Array.isTemplateObject({});
Array.isTemplateObject(['a', 'b']);
Array.isTemplateObject(Object.freeze(['foo', 'bar']));
Array.isTemplateObject(123);
Array.isTemplateObject('str');
Array.isTemplateObject(Symbol());

declare const x: unknown;
if (Array.isTemplateObject(x)) {
  x.raw;
  const _: readonly string[] = x.raw;
}

// @ts-expect-error
Array.isTemplateObject();
