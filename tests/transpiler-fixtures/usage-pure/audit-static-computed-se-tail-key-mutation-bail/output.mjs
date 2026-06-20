// a static monkey-patched through a comma-sequence computed key (`Array[(touch(), "from")] = ...`):
// only the tail names the slot, so the patch lands on `Array.from`. the read side peels the same
// tail, so the later call keeps the user patch
let touched = 0;
Array[touched++, "from"] = function () {
  return [];
};
Array.from([1, 2, 3]);