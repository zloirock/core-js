// An observed supplied receiver keeps its identity; its static is extracted in the body.
export const effects = [];
export const r = (function ({ from } = Object) {
  return [from([4])[0], arguments.length === 1];
})((effects.push('argument'), Array));
