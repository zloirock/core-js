// `isPlainObject` rejects class instances - a `new Map()` or `new Date()` is not a plain
// targets object; browserslist would pass an opaque "Unknown browser query" without this guard
class CustomTargets { constructor() { this.ie = 11; } }

export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: new CustomTargets(),
    }],
  ],
};
