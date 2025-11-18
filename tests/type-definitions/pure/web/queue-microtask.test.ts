import $queueMicrotask from '@core-js/pure/full/queue-microtask';

$queueMicrotask((): void => {});
$queueMicrotask(function (): void {});

// @ts-expect-error
$queueMicrotask();
// @ts-expect-error
$queueMicrotask('not a function');
// @ts-expect-error
$queueMicrotask((a) => {});
