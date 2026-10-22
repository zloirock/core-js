// `Vary` is a list other middleware writes to as well - `cors`, `compression`, the application.
// setting it instead of adding to it drops their fields, and a shared cache then hands the next
// visitor somebody else's response
export default function varyBy(response, field) {
  const named = String(response.getHeader('vary') ?? '').split(',').map(token => token.trim().toLowerCase()).filter(Boolean);

  // `*` says the response varies by things a cache cannot see, which already covers this one
  if (named.includes('*') || named.includes(field)) return;

  response.setHeader('vary', [...named, field].join(', '));
}
