// `isPlainObject` accepts `Object.create(null)` alongside Object.prototype-backed objects so
// callers using prototype-less objects for security/mocking still satisfy the targets contract
const targets = Object.create(null);
targets.ie = 11;

export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets,
    }],
  ],
};
