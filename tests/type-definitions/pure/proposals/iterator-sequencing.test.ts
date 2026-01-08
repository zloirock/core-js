import iteratorConcat from '@core-js/pure/full/iterator/concat';
import { CoreJSIteratorAndIteratorLike } from '../../helpers';

declare const its1: Iterable<string>;
declare const arrs: string[];
declare const arrn: number[];
declare const arrb: boolean[];
declare const itb1: Iterable<boolean>;

const ri1: CoreJSIteratorAndIteratorLike<number | string> = iteratorConcat(its1);
const ri2: CoreJSIteratorAndIteratorLike<number | string> = iteratorConcat(arrs);
const ri3: CoreJSIteratorAndIteratorLike<number> = iteratorConcat(arrn);
const ri4: CoreJSIteratorAndIteratorLike<number | boolean> = iteratorConcat(arrb, itb1);
const ri5: CoreJSIteratorAndIteratorLike<number> = iteratorConcat();

// @ts-expect-error
iteratorConcat(1);
// @ts-expect-error
iteratorConcat(true);
// @ts-expect-error
iteratorConcat({});
