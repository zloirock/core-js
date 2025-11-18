import '@core-js/full';
import '@core-js/types';

queueMicrotask((): void => {});
queueMicrotask(function (): void {});

// @ts-expect-error
queueMicrotask();
// @ts-expect-error
queueMicrotask('not a function');
// @ts-expect-error
queueMicrotask((a) => {});
