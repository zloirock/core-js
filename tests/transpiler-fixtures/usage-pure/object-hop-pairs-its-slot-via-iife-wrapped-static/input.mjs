// ... on the IIFE argument too, and a for-of head's wrapped element types its slot through the
// wrapper level exactly as the flat head types the element
const viaIifeWrappedStatic = (([{ w: { Array: { from: m } } }]) => m)([{ w: globalThis }]);
export default [viaIifeWrappedStatic];
