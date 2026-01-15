import 'core-js/full';

declare const urlLike: URL;
const str: string = urlLike.toJSON();

// @ts-expect-error
const num: number = urlLike.toJSON();
// @ts-expect-error
urlLike.toJSON('param');

// todo add after URL becomes constructable in types
// const url1 = new URL('https://example.com');
// new URL('page', 'https://example.com');
// new URL('/path', url1);
//
// // @ts-expect-error
// new URL();
// // @ts-expect-error
// new URL(123);
// // @ts-expect-error
// new URL('abc', 456);
