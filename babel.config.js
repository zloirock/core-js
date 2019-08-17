'use strict';
module.exports = {
  // use transforms which does not use ES5+ builtins
  plugins: [
    ['@babel/proposal-optional-catch-binding'],
    ['@babel/transform-member-expression-literals'],
    ['@babel/transform-property-literals'],
    ['@babel/transform-arrow-functions'],
    ['@babel/transform-block-scoped-functions'],
    ['@babel/transform-block-scoping'],
    ['@babel/transform-classes', { loose: true }],
    ['@babel/transform-computed-properties', { loose: true }],
    ['@babel/transform-destructuring', { loose: true }],
    ['@babel/transform-literals'],
    ['@babel/transform-parameters'],
    ['@babel/transform-shorthand-properties'],
    ['@babel/transform-spread', { loose: true }],
    ['@babel/transform-template-literals', { loose: true, spec: true }],
    ['@babel/transform-exponentiation-operator'],
    ['transform-for-of-as-array'],
    // use it instead of webpack es modules for support engines without descriptors
    ['transform-es2015-modules-simple-commonjs'],
  ],
};
