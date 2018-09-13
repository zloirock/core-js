'use strict';
module.exports = {
  // use transforms which does not use ES5+ builtins
  plugins: [
    ['@babel/transform-member-expression-literals'],
    ['@babel/transform-property-literals'],
    // use it instead of webpack es modules for support engines without descriptors
    ['@babel/transform-modules-commonjs', { loose: true }],
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
  ],
};
