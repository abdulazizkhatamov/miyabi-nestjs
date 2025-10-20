import { csrfSync } from 'csrf-sync';

export const {
  csrfSynchronisedProtection,
  generateToken,
  getTokenFromRequest,
} = csrfSync({
  getTokenFromRequest: (req) => {
    return req.headers['x-csrf-token'] as string;
  },
});
