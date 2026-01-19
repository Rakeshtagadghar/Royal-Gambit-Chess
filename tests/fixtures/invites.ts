import { USER_IDS } from './users';
import { TIME_CONTROLS } from './games';

// Invitation status types
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';

// Invitation interface
export interface Invitation {
  id: string;
  senderId: string;
  recipientId: string;
  status: InvitationStatus;
  timeControl: { baseMs: number; incrementMs: number };
  colorPreference: 'white' | 'black' | 'random';
  gameId?: string;
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
}

// Deterministic invitation IDs
export const INVITATION_IDS = {
  pending: 'inv-pending-1111-1111-111111111111',
  accepted: 'inv-accepted-2222-2222-222222222222',
  declined: 'inv-declined-3333-3333-333333333333',
  expired: 'inv-expired-4444-4444-444444444444',
  cancelled: 'inv-cancelled-5555-5555-555555555555',
} as const;

// Mock Invitations
export const mockInvitations: Record<string, Invitation> = {
  pending: {
    id: INVITATION_IDS.pending,
    senderId: USER_IDS.playerA,
    recipientId: USER_IDS.playerB,
    status: 'pending',
    timeControl: TIME_CONTROLS.blitz5,
    colorPreference: 'random',
    createdAt: '2024-01-15T10:00:00Z',
    expiresAt: '2024-01-15T10:30:00Z',
  },
  accepted: {
    id: INVITATION_IDS.accepted,
    senderId: USER_IDS.playerA,
    recipientId: USER_IDS.playerB,
    status: 'accepted',
    timeControl: TIME_CONTROLS.blitz5,
    colorPreference: 'white',
    gameId: 'game-from-invite-1234',
    createdAt: '2024-01-14T15:00:00Z',
    expiresAt: '2024-01-14T15:30:00Z',
    respondedAt: '2024-01-14T15:05:00Z',
  },
  declined: {
    id: INVITATION_IDS.declined,
    senderId: USER_IDS.playerB,
    recipientId: USER_IDS.playerA,
    status: 'declined',
    timeControl: TIME_CONTROLS.rapid10,
    colorPreference: 'black',
    createdAt: '2024-01-14T12:00:00Z',
    expiresAt: '2024-01-14T12:30:00Z',
    respondedAt: '2024-01-14T12:10:00Z',
  },
  expired: {
    id: INVITATION_IDS.expired,
    senderId: USER_IDS.playerA,
    recipientId: USER_IDS.spectator,
    status: 'expired',
    timeControl: TIME_CONTROLS.bullet1,
    colorPreference: 'random',
    createdAt: '2024-01-13T08:00:00Z',
    expiresAt: '2024-01-13T08:30:00Z',
  },
  cancelled: {
    id: INVITATION_IDS.cancelled,
    senderId: USER_IDS.playerA,
    recipientId: USER_IDS.playerB,
    status: 'cancelled',
    timeControl: TIME_CONTROLS.blitz3,
    colorPreference: 'white',
    createdAt: '2024-01-12T14:00:00Z',
    expiresAt: '2024-01-12T14:30:00Z',
    respondedAt: '2024-01-12T14:05:00Z',
  },
};

// Factory function to create custom invitation
export function createInvitation(overrides: Partial<Invitation> = {}): Invitation {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

  return {
    id: `inv-${Date.now()}`,
    senderId: USER_IDS.playerA,
    recipientId: USER_IDS.playerB,
    status: 'pending',
    timeControl: TIME_CONTROLS.blitz5,
    colorPreference: 'random',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ...overrides,
  };
}

// Helper to check if invitation is expired
export function isInvitationExpired(invitation: Invitation): boolean {
  return new Date(invitation.expiresAt) < new Date();
}

// Helper to calculate time to expiry
export function getTimeToExpiry(invitation: Invitation): number {
  const expiresAt = new Date(invitation.expiresAt).getTime();
  const now = Date.now();
  return Math.max(0, expiresAt - now);
}

// Helper to format expiry time
export function formatExpiryTime(invitation: Invitation): string {
  const timeToExpiry = getTimeToExpiry(invitation);
  if (timeToExpiry <= 0) return 'Expired';

  const minutes = Math.floor(timeToExpiry / 60000);
  const seconds = Math.floor((timeToExpiry % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
