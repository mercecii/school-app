// E.164 only. Required because self-adopt in utils/phoneRoleAdoption.ts is
// authorized by rules via an exact match against Firebase's
// request.auth.token.phone_number claim (E.164) — a loosely formatted
// admin-entered number would find the doc but fail the adopt write. See
// docs/decisions.md and docs/TODO.md §3/§4.
export const E164_REGEX = /^\+\d{10,15}$/;

export function isValidE164(phone: string): boolean {
  return E164_REGEX.test(phone.trim());
}
