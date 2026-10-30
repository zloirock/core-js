// A kept computed key runs before its extracted read and the loop body.
// The surviving length binding still reads the original receiver.
const rows = [4, 9];
for (var { [(record(typeof method), 'at')]: method, length: size } = rows, once = true; once; once = false) {
  use(method.call(rows, -1), size);
}
