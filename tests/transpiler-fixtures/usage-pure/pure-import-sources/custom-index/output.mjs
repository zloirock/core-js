import P from 'my-pure/actual/promise/index.js';
import Extra from '@vendor/pure/actual/promise.js';
const {
  resolve,
  ...rest
} = P;
const {
  reject,
  ...extra
} = Extra;
use(resolve, rest, reject, extra);