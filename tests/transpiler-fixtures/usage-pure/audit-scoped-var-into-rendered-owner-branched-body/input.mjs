// The calls inside the branch keep their own temporaries. The call after the optional
// chain uses a separate module-level temporary, including when window is absent.
export const branchedBody = (() => {
  if (globalThis) {
    const inner = ['ab'].at(0).padStart(3, '-');
    return inner.length ? globalThis : null;
  }
  return null;
})()?.window?.JSON.parse('1');
export const outer = [branchedBody].at(0);
