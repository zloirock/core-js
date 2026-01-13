import 'core-js/full';

const ref: typeof globalThis = self;

// @ts-expect-error
self();
// @ts-expect-error
self = {};
