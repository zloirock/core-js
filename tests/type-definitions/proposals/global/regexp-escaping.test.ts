import 'core-js/full';

const escaped1: string = RegExp.escape('foo.*+?^${}()|[]\\');
const escaped2: string = RegExp.escape('');
const s: string = 'abc';
const escaped3: string = RegExp.escape(s);

// Некорректные вызовы

// @ts-expect-error
RegExp.escape();
// @ts-expect-error
RegExp.escape(123);
// @ts-expect-error
RegExp.escape();
// @ts-expect-error
RegExp.escape({});
// @ts-expect-error
RegExp.escape(/abc/);
// @ts-expect-error
RegExp.escape([]);
// @ts-expect-error
const wrong: number = RegExp.escape('boo');
// @ts-expect-error
RegExp.escape('foo', 'bar');
