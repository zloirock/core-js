import 'core-js/stable';
import $queueMicrotask from 'core-js/stable/queue-microtask';

$queueMicrotask((): void => {});

queueMicrotask((): void => {});
queueMicrotask(function (): void {});

// @ts-expect-error
$queueMicrotask();

// @ts-expect-error
queueMicrotask();
// @ts-expect-error
queueMicrotask('not a function');
// @ts-expect-error
queueMicrotask(a => {});
