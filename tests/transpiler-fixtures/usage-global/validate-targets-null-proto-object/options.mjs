// `Object.create(null)` is a legitimate plain object - validator must accept it alongside
// `Object.prototype`-backed objects
const targets = Object.create(null);
targets.ie = 11;

export default {
  plugins: [
    ['@core-js', {
      method: 'usage-global',
      version: '4.0',
      targets,
    }],
  ],
};
