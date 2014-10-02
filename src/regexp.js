// ~ES7 : https://gist.github.com/kangax/9698100
$define(STATIC, REGEXP, {
  escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});