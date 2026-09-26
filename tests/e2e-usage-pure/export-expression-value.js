// The call lives in the export expression itself, before any test callback runs.
export default [1, [2]].flat().at(-1);
