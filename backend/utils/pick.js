// Copy only whitelisted keys from an object (prevents mass assignment)
export default function pick(obj = {}, keys = []) {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}
