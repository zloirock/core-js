// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
// core-js-disable-next-line
delete Map.groupBy;
r = typeof Map.groupBy;