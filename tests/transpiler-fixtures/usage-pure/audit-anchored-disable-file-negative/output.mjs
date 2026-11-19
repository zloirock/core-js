// core-js-disable-file
// a file-wide directive suppresses the hop trigger like every other emission - the
// statement survives verbatim, no anchor, no imports
const {
  Map: {
    custom
  }
} = globalThis;
console.log(custom);