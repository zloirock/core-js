import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A key can replace the receiver binding after the member captured its old value.
// The call must keep that original receiver as this, including a non-callable method.
export function read(receiver, replacement, argument) {
  return receiver[receiver = replacement, 'at'](argument());
}