import $structuredClone from '@core-js/pure/full/structured-clone';

const n: number = $structuredClone(5);
const s: string = $structuredClone('text');

declare const buffer: ArrayBuffer;
const obj = { buffer };
const cloned: typeof obj = $structuredClone(obj, { transfer: [buffer] });

// @ts-expect-error
$structuredClone();
// @ts-expect-error
$structuredClone('text', {}, 'extra');
// @ts-expect-error
const n2: number = $structuredClone('1');
