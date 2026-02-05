import $Math from '@core-js/pure/full/math';
import $MathIndex from '@core-js/pure/full/math/index';
import $MathIndexJS from '@core-js/pure/full/math/index.js';
import $Array from '@core-js/pure/full/array';
import $ArrayIndex from '@core-js/pure/full/array/index';
import $ArrayIndexJS from '@core-js/pure/full/array/index.js';
import chunks from '@core-js/pure/full/iterator/chunks';
import chunksJS from '@core-js/pure/full/iterator/chunks.js';

$Math.f16round(7.9999999);
$MathIndex.f16round(7.9999999);
$MathIndexJS.f16round(7.9999999);

$Array.from([1, 2, 3]);
$ArrayIndex.from([1, 2, 3]);
$ArrayIndexJS.from([1, 2, 3]);

declare const num: Iterator<number>;
chunks(num, 2);
chunksJS(num, 2);
