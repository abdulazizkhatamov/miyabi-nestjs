// libs/common/src/csrf/csrf-sync.ts
import { csrfSync } from 'csrf-sync';

// Use default session key (_csrfSecret) and read token from x-csrf-token header
const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    const token = req.headers['x-csrf-token'] as string;
    console.log(`getTokenFromRequest token: ${token}`);
    return token;
  },
  getTokenFromState: (req) => {
    const token = req.session.csrfToken;
    console.log(`getTokenFromState token: ${token}`);
    return token;
  },
});

export { generateToken, csrfSynchronisedProtection };
