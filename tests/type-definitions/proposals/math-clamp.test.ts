import 'core-js/full';

const rc1: number = Math.clamp(1, 2, 5);

// @ts-expect-error
Math.clamp(1, 2);
// @ts-expect-error
Math.clamp(2, 2, '4');
