// URL has conflicts with @types/node
// /// <reference types="../core-js-modules/url" />

// import * as url from 'core-js/internals/web/url';
//
// declare global {
//   interface URL extends url.URL {}
//   var URL: typeof globalThis extends { onmessage: any; URL: infer T } ? T : typeof url.URL;
//
//   interface URLSearchParams extends url.URLSearchParams {}
//   var URLSearchParams: typeof globalThis extends { onmessage: any; URLSearchParams: infer T } ? T
//     : typeof url.URLSearchParams;
// }
//
// export {};
