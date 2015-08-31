module.exports = function(config) {
  config.set({
    frameworks: ['qunit'],
    basePath: '../',
    files: ['client/core.js', 'tests/tests.js'],
    browsers: ['Chrome', 'Firefox', 'IE', 'PhantomJS']
  });
};