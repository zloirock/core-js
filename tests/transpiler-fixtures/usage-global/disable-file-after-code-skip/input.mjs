// `core-js-disable-file` directive only takes effect when placed at file head; here it appears
// after a code statement, so the entire file (including code below the directive) gets polyfilled
arr.includes(x);
// core-js-disable-file
arr.at(0);
