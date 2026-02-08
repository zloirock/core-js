import iteratorConcat from '@core-js/pure/full/iterator/concat';
import { assertCoreJSIteratorLike } from '../../helpers.pure.js';

declare const its1: Iterable<string>;
declare const arrs: string[];
declare const arrn: number[];
declare const arrb: boolean[];
declare const itb1: Iterable<boolean>;

const ri1 = iteratorConcat(its1);
assertCoreJSIteratorLike<string>(ri1);
const ri2 = iteratorConcat(arrs);
assertCoreJSIteratorLike<string>(ri2);
const ri3 = iteratorConcat(arrn);
assertCoreJSIteratorLike<number>(ri3);
const ri4 = iteratorConcat(arrb, itb1);
assertCoreJSIteratorLike<boolean>(ri4);
const ri5 = iteratorConcat();
assertCoreJSIteratorLike<unknown>(ri5);

// @ts-expect-error
iteratorConcat(1);
// @ts-expect-error
iteratorConcat(true);
// @ts-expect-error
iteratorConcat({});
