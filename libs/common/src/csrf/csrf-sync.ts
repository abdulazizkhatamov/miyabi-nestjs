// libs/common/src/csrf/csrf-sync.ts
import { csrfSync } from 'csrf-sync';

// Use default session key (_csrfSecret) and read token from x-csrf-token header
const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});

export { generateToken, csrfSynchronisedProtection };
