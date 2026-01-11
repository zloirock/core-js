import $AggregateError from '@core-js/pure/full/aggregate-error';
// import $Error from '@core-js/pure/full/error'; TODO separated entry points
import { assertHasCause } from '../../helpers';

const prevError = new Error('Prev error');
const someError = new Error('Some error');

// TODO other errors after separating Error entry points

const resAE1 = new $AggregateError([someError], 'Error with cause', { cause: prevError });
assertHasCause(resAE1);
const resAE2 = new $AggregateError([someError], 'Error with cause', { cause: null });
assertHasCause(resAE2);
const resAE3 = new $AggregateError([someError], 'Error with cause', { cause: 'prev reason' });
assertHasCause(resAE3);
