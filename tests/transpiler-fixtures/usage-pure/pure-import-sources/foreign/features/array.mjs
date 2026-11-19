// A user module whose path resembles a polyfill entry; its static is deliberately different.
export default {
  from(value) {
    return ['foreign', value[0]];
  },
};
