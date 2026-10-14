// An instance leaf under a hop default the assigned literal proves dead, beside a sibling: unplugin extracts
// it off the literal's slot (the sidecar), while babel keeps the read native - its debt. The declaration form
// keeps it native in both emitters.
let fl, zw;
const holder = {
  list: [1, 2]
};
({
  w: {
    y: {
      flat: fl
    }
  } = {
    y: [1]
  },
  zw
} = {
  w: {
    y: holder.list
  },
  zw: 1
});