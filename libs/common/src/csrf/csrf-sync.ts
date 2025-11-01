// libs/common/src/csrf/csrf-sync.ts
import { csrfSync } from 'csrf-sync';

// Use default session key (_csrfSecret) and read token from x-csrf-token header
const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    const token = req.headers['x-csrf-token'] as string;
    return token;
  },
  getTokenFromState: (req) => {
    const token = req.session.csrfToken;
    return token;
  },
});

export { generateToken, csrfSynchronisedProtection };
