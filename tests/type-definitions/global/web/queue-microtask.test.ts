import 'core-js/full';

queueMicrotask((): void => {});
queueMicrotask(function (): void {});

// @ts-expect-error
queueMicrotask();
// @ts-expect-error
queueMicrotask('not a function');
// @ts-expect-error
queueMicrotask((a) => {});
