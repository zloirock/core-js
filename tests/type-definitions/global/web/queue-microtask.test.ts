import 'core-js/full';
import $queueMicrotask from 'core-js/full/queue-microtask';

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
