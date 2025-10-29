// libs/common/src/csrf/csrf-sync.ts
import { csrfSync } from 'csrf-sync';

// Use default session key (_csrfSecret) and read token from x-csrf-token header
const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    const csrfToken = req.session.csrfToken;
    console.log(`Got token from server state: ${csrfToken}`);
    return csrfToken;
  },
});

export { generateToken, csrfSynchronisedProtection };
