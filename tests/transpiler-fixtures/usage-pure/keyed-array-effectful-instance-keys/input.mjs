// Two computed instance keys keep their effects at the native property reads.
// The outer key and array iteration select the receiver once for both leaves.
const { w: [{ [(effect(), 'at')]: at, [(effect(), 'flat')]: flat }] } = { w: [[1, [2]]] };
use(at, flat);
