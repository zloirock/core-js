import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
function use() {/* empty */}
function raise() {/* empty */}
try {
  raise();
} catch ({
  c: {
    allSettled
  } = {
    allSettled: _Promise$allSettled
  }
}) {
  use(allSettled);
}