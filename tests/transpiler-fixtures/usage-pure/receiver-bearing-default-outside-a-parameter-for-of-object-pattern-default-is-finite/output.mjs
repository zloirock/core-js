import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
const list = [];
function use() {/* empty */}
for (const {
  d: {
    isFinite
  } = {
    isFinite: _Number$isFinite
  }
} of list) use(isFinite);