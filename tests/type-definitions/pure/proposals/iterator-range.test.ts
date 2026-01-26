import iteratorRange from '@core-js/pure/full/iterator/range';
import { assertCoreJSIteratorLike } from '../../helpers';

const rir1 = iteratorRange(1, 10);
assertCoreJSIteratorLike<number>(rir1);
iteratorRange(1, 10, 1);
iteratorRange(1, 10, { step: 1 });
iteratorRange(1, 10, { inclusive: true });

// @ts-expect-error
iteratorRange(0, 10, 'not-a-number');
// @ts-expect-error
iteratorRange(0, 10, { inclusive: 3 });
// @ts-expect-error
iteratorRange(0, 10, { step: 'smth' });
// @ts-expect-error
iteratorRange(0, 10, { foo: 'bar' });
