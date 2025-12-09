import 'core-js/full';

const s: string = btoa("SGVsbG8gd29ybGQ=");

// @ts-expect-error
atob();
// @ts-expect-error
atob(123);
// @ts-expect-error
atob({});
