// TSNonNullExpression on a computed-key alias (`k!`) without outer parens
const arr = [1, 2, 3];
const k: 'at' | undefined = 'at';
arr[k!](0);
