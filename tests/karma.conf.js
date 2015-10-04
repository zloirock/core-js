module.exports = function(config) {
  config.set({
    frameworks: ['qunit'],
    basePath: '../',
    files: ['client/core.js', 'tests/helpers.js', 'tests/tests.js'],
    browsers: ['Chrome', 'Firefox', 'IE', 'PhantomJS']
  });
};