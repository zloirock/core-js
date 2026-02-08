import 'core-js/stable';
import $structuredClone from 'core-js/stable/structured-clone';
import { assertNumber, assertString } from '../../helpers.js';

assertNumber($structuredClone(5));

assertNumber(structuredClone(5));
assertString(structuredClone('text'));

declare const buffer: ArrayBuffer;
const obj = { buffer };
const cloned: typeof obj = structuredClone(obj, { transfer: [buffer] });

// @ts-expect-error
$structuredClone();

// @ts-expect-error
structuredClone();
// @ts-expect-error
structuredClone('text', {}, 'extra');
// @ts-expect-error
const n2: number = structuredClone('1');
