type AuthInit = RequestInit & { next?: { internal: true } };

const RETRY_DELAY_MS = 150;

function describe(error: unknown) {
  if (!(error instanceof Error)) return String(error);
  const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
  return [error.message, cause?.code, cause?.message].filter(Boolean).join(" · ");
}

// Next cancels a normal fetch while a page or server action is still rendering.
// Sign-in then dies in a few milliseconds, before the password is checked.
// An internal fetch is sent on the real network. A render abort must not cancel it.
// A pooled connection the auth server already closed fails instantly, so one retry
// opens a fresh connection before the user sees "Could not reach the sign-in service".
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const { signal: _signal, ...rest } = init ?? {};
  const nextInit: AuthInit = { ...rest, next: { internal: true } };
  try {
    return await globalThis.fetch(input, nextInit);
  } catch (error) {
    console.warn(`Auth request failed, retrying once: ${describe(error)}`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    try {
      return await globalThis.fetch(input, nextInit);
    } catch (retryError) {
      console.error(`Auth request failed again: ${describe(retryError)}`);
      throw retryError;
    }
  }
}
