import "core-js/modules/es.string.includes";
// direct call, discarded dynamic read and function-skipping serialization keep the narrow
const direct = {
  marks: 'mn',
  test() {
    return this.marks.includes('m');
  }
};
direct.test();