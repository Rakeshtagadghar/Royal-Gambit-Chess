export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';

export type InvitationColorPreference = 'white' | 'black' | 'random';

export interface InvitationTimeControl {
  initialSeconds: number;
  incrementSeconds: number;
}

export interface Invitation {
  id: string;
  fromUserId: string;
  toUserId: string | null;
  toEmail: string | null;
  /**
   * Convenience field from the server route (best-effort).
   * Realtime updates may not include this immediately.
   */
  toUsername: string | null;
  status: InvitationStatus;
  timeControl: InvitationTimeControl;
  colorPreference: InvitationColorPreference;
  gameId: string | null;
  expiresAt: string;
  createdAt: string;
}


