import 'core-js/full';
import '@core-js/types';

const prevError = new Error('Prev error');

const resE1: Error = new Error('Error with cause', { cause: prevError });
const resE2: Error = new Error('Error with cause', { cause: null });
const resE3: Error = new Error('Error with cause', { cause: 'prev reason' });

const resEE1: EvalError = new EvalError('Error with cause', { cause: prevError });
const resEE2: EvalError = new EvalError('Error with cause', { cause: null });
const resEE3: EvalError = new EvalError('Error with cause', { cause: 'prev reason' });

const resRE1: RangeError = new RangeError('Error with cause', { cause: prevError });
const resRE2: RangeError = new RangeError('Error with cause', { cause: null });
const resRE3: RangeError = new RangeError('Error with cause', { cause: 'prev reason' });

const resReE1: ReferenceError = new ReferenceError('Error with cause', { cause: prevError });
const resReE2: ReferenceError = new ReferenceError('Error with cause', { cause: null });
const resReE3: ReferenceError = new ReferenceError('Error with cause', { cause: 'prev reason' });

const resSE1: SyntaxError = new SyntaxError('Error with cause', { cause: prevError });
const resSE2: SyntaxError = new SyntaxError('Error with cause', { cause: null });
const resSE3: SyntaxError = new SyntaxError('Error with cause', { cause: 'prev reason' });

const resTE1: TypeError = new TypeError('Error with cause', { cause: prevError });
const resTE2: TypeError = new TypeError('Error with cause', { cause: null });
const resTE3: TypeError = new TypeError('Error with cause', { cause: 'prev reason' });

const resUE1: URIError = new URIError('Error with cause', { cause: prevError });
const resUE2: URIError = new URIError('Error with cause', { cause: null });
const resUE3: URIError = new URIError('Error with cause', { cause: 'prev reason' });
