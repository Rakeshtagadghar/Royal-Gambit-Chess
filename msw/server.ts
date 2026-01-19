import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server for Node.js environment (tests)
export const server = setupServer(...handlers);

// Export handlers for extending in tests
export { handlers };
