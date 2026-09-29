// A write through the carrier reaches the held literal and prevents array-only dispatch.
const box = { data: [1, 2] };
const wrap = { inner: box };
wrap.inner.data = 'abc';
export const { at } = box.data;
