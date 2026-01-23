import 'core-js/full';

const ex1 = new DOMException();
const ex2 = new DOMException('Some message');
const ex3 = new DOMException('Some message', 'SyntaxError');

// @ts-expect-error
DOMException();
// @ts-expect-error
DOMException(123);
