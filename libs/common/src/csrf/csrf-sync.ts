// libs/common/src/csrf/csrf-sync.ts
import { csrfSync } from 'csrf-sync';

const {
  invalidCsrfTokenError,
  csrfSynchronisedProtection,
  generateToken,
  getTokenFromRequest,
} = csrfSync({
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});

// ✅ Only export what you actually need outside
export { csrfSynchronisedProtection, generateToken, getTokenFromRequest };

// If you really want to expose an error object:
export const CSRF_ERROR = {
  message: invalidCsrfTokenError.message,
  status: 403,
};
