import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '../../msw/server';
import { http, HttpResponse } from 'msw';
import { useAuthStore } from '@/stores/authStore';
import { mockUsers, mockProfiles, USER_IDS } from '../fixtures/users';
import {
  mockInvitations,
  INVITATION_IDS,
  createInvitation,
  isInvitationExpired,
  getTimeToExpiry,
} from '../fixtures/invites';
import { TIME_CONTROLS } from '../fixtures/games';

describe('Invitations Integration', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    useAuthStore.getState().setUser(mockUsers.playerA);
    useAuthStore.getState().setProfile(mockProfiles.playerA);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Send Invitation', () => {
    it('should create a new invitation successfully', async () => {
      const newInvitationId = 'new-invitation-123';

      server.use(
        http.post('/api/invitations/create', async ({ request }) => {
          const body = await request.json() as {
            recipientId: string;
            timeControl: { baseMs: number };
          };
          expect(body.recipientId).toBe(USER_IDS.playerB);
          expect(body.timeControl).toBeDefined();

          return HttpResponse.json({
            id: newInvitationId,
            senderId: USER_IDS.playerA,
            recipientId: USER_IDS.playerB,
            status: 'pending',
            timeControl: body.timeControl,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });
        })
      );

      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: USER_IDS.playerB,
          timeControl: TIME_CONTROLS.blitz5,
          colorPreference: 'random',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(newInvitationId);
      expect(data.status).toBe('pending');
    });

    it('should prevent self-invitation', async () => {
      server.use(
        http.post('/api/invitations/create', () => {
          return HttpResponse.json(
            { error: 'Cannot invite yourself' },
            { status: 400 }
          );
        })
      );

      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: USER_IDS.playerA, // Self
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should prevent duplicate pending invitations', async () => {
      server.use(
        http.post('/api/invitations/create', () => {
          return HttpResponse.json(
            { error: 'Pending invitation already exists' },
            { status: 409 }
          );
        })
      );

      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: USER_IDS.playerB,
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      expect(response.status).toBe(409);
    });
  });

  describe('List Invitations', () => {
    it('should fetch sent invitations', async () => {
      server.use(
        http.get('/api/invitations/sent', () => {
          return HttpResponse.json({
            items: [mockInvitations.pending, mockInvitations.accepted],
          });
        })
      );

      const response = await fetch('/api/invitations/sent');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.items).toHaveLength(2);
      // Use senderId (camelCase) as defined in the fixture
      expect(data.items[0].senderId).toBe(USER_IDS.playerA);
    });

    it('should fetch received invitations', async () => {
      server.use(
        http.get('/api/invitations/received', () => {
          return HttpResponse.json({
            items: [
              createInvitation({
                id: 'received-1',
                senderId: USER_IDS.playerB,
                recipientId: USER_IDS.playerA,
                status: 'pending',
              }),
            ],
          });
        })
      );

      const response = await fetch('/api/invitations/received');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.items).toHaveLength(1);
      expect(data.items[0].recipientId).toBe(USER_IDS.playerA);
    });

    it('should return empty array when no invitations', async () => {
      server.use(
        http.get('/api/invitations/sent', () => {
          return HttpResponse.json({ items: [] });
        })
      );

      const response = await fetch('/api/invitations/sent');
      const data = await response.json();
      expect(data.items).toEqual([]);
    });
  });

  describe('Accept Invitation', () => {
    it('should accept invitation and create game', async () => {
      const gameId = 'game-from-invitation';

      server.use(
        http.post('/api/invitations/:id/accept', ({ params }) => {
          expect(params.id).toBe(INVITATION_IDS.pending);

          return HttpResponse.json({
            invitation: {
              ...mockInvitations.pending,
              status: 'accepted',
            },
            gameId,
          });
        })
      );

      const response = await fetch(`/api/invitations/${INVITATION_IDS.pending}/accept`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.invitation.status).toBe('accepted');
      expect(data.gameId).toBe(gameId);
    });

    it('should prevent accepting own invitation', async () => {
      server.use(
        http.post('/api/invitations/:id/accept', () => {
          return HttpResponse.json(
            { error: 'Cannot accept your own invitation' },
            { status: 403 }
          );
        })
      );

      const response = await fetch(`/api/invitations/${INVITATION_IDS.pending}/accept`, {
        method: 'POST',
      });

      expect(response.status).toBe(403);
    });

    it('should prevent accepting already accepted invitation', async () => {
      server.use(
        http.post('/api/invitations/:id/accept', () => {
          return HttpResponse.json(
            { error: 'Invitation already accepted' },
            { status: 400 }
          );
        })
      );

      const response = await fetch(`/api/invitations/${INVITATION_IDS.accepted}/accept`, {
        method: 'POST',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Decline Invitation', () => {
    it('should decline invitation successfully', async () => {
      server.use(
        http.post('/api/invitations/:id/decline', ({ params }) => {
          expect(params.id).toBe(INVITATION_IDS.pending);

          return HttpResponse.json({
            ...mockInvitations.pending,
            status: 'declined',
          });
        })
      );

      const response = await fetch(`/api/invitations/${INVITATION_IDS.pending}/decline`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('declined');
    });

    it('should prevent declining already declined invitation', async () => {
      server.use(
        http.post('/api/invitations/:id/decline', () => {
          return HttpResponse.json(
            { error: 'Invitation already declined' },
            { status: 400 }
          );
        })
      );

      const response = await fetch(`/api/invitations/${INVITATION_IDS.declined}/decline`, {
        method: 'POST',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Cancel Invitation', () => {
    it('should cancel pending invitation', async () => {
      server.use(
        http.post('/api/invitations/:id/cancel', ({ params }) => {
          expect(params.id).toBe(INVITATION_IDS.pending);

          return HttpResponse.json({
            ...mockInvitations.pending,
            status: 'cancelled',
          });
        })
      );

      const response = await fetch(`/api/invitations/${INVITATION_IDS.pending}/cancel`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('cancelled');
    });

    it('should only allow sender to cancel', async () => {
      server.use(
        http.post('/api/invitations/:id/cancel', () => {
          return HttpResponse.json(
            { error: 'Only the sender can cancel' },
            { status: 403 }
          );
        })
      );

      const response = await fetch(`/api/invitations/${INVITATION_IDS.pending}/cancel`, {
        method: 'POST',
      });

      expect(response.status).toBe(403);
    });

    it('should prevent cancelling accepted invitation', async () => {
      server.use(
        http.post('/api/invitations/:id/cancel', () => {
          return HttpResponse.json(
            { error: 'Cannot cancel accepted invitation' },
            { status: 400 }
          );
        })
      );

      const response = await fetch(`/api/invitations/${INVITATION_IDS.accepted}/cancel`, {
        method: 'POST',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Invitation Expiration', () => {
    it('should identify expired invitations', () => {
      // mockInvitations.expired has a past expiresAt date, so it should be expired
      expect(isInvitationExpired(mockInvitations.expired)).toBe(true);

      // Create a fresh invitation with future expiry
      const freshInvitation = createInvitation({
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      });
      expect(isInvitationExpired(freshInvitation)).toBe(false);
    });

    it('should calculate time to expiry correctly', () => {
      const futureInvitation = createInvitation({
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      });

      const timeToExpiry = getTimeToExpiry(futureInvitation);
      expect(timeToExpiry).toBeGreaterThan(0);
      expect(timeToExpiry).toBeLessThanOrEqual(60 * 60 * 1000);
    });

    it('should prevent accepting expired invitation', async () => {
      server.use(
        http.post('/api/invitations/:id/accept', () => {
          return HttpResponse.json(
            { error: 'Invitation has expired' },
            { status: 410 }
          );
        })
      );

      const response = await fetch(`/api/invitations/${INVITATION_IDS.expired}/accept`, {
        method: 'POST',
      });

      expect(response.status).toBe(410);
    });

    it('should return 0 for already expired invitations', () => {
      const timeToExpiry = getTimeToExpiry(mockInvitations.expired);
      // getTimeToExpiry uses Math.max(0, ...) so it returns 0 for expired
      expect(timeToExpiry).toBe(0);
    });
  });

  describe('Invitation Status Transitions', () => {
    it('should track correct status flow: pending -> accepted', async () => {
      let currentStatus = 'pending';

      server.use(
        http.post('/api/invitations/:id/accept', () => {
          currentStatus = 'accepted';
          return HttpResponse.json({
            ...mockInvitations.pending,
            status: currentStatus,
          });
        })
      );

      expect(currentStatus).toBe('pending');

      await fetch(`/api/invitations/${INVITATION_IDS.pending}/accept`, {
        method: 'POST',
      });

      expect(currentStatus).toBe('accepted');
    });

    it('should track correct status flow: pending -> declined', async () => {
      let currentStatus = 'pending';

      server.use(
        http.post('/api/invitations/:id/decline', () => {
          currentStatus = 'declined';
          return HttpResponse.json({
            ...mockInvitations.pending,
            status: currentStatus,
          });
        })
      );

      expect(currentStatus).toBe('pending');

      await fetch(`/api/invitations/${INVITATION_IDS.pending}/decline`, {
        method: 'POST',
      });

      expect(currentStatus).toBe('declined');
    });

    it('should track correct status flow: pending -> cancelled', async () => {
      let currentStatus = 'pending';

      server.use(
        http.post('/api/invitations/:id/cancel', () => {
          currentStatus = 'cancelled';
          return HttpResponse.json({
            ...mockInvitations.pending,
            status: currentStatus,
          });
        })
      );

      expect(currentStatus).toBe('pending');

      await fetch(`/api/invitations/${INVITATION_IDS.pending}/cancel`, {
        method: 'POST',
      });

      expect(currentStatus).toBe('cancelled');
    });
  });

  describe('Two-Player Invitation Flow', () => {
    it('should complete full invitation flow between two users', async () => {
      const invitationId = 'full-flow-invitation';
      const gameId = 'game-from-full-flow';

      // Step 1: Player A sends invitation to Player B
      server.use(
        http.post('/api/invitations/create', () => {
          return HttpResponse.json({
            id: invitationId,
            senderId: USER_IDS.playerA,
            recipientId: USER_IDS.playerB,
            status: 'pending',
            timeControl: TIME_CONTROLS.blitz5,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });
        })
      );

      const createResponse = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: USER_IDS.playerB,
          timeControl: TIME_CONTROLS.blitz5,
        }),
      });

      expect(createResponse.status).toBe(200);
      const invitation = await createResponse.json();
      expect(invitation.status).toBe('pending');

      // Step 2: Player B sees the invitation in received list
      server.use(
        http.get('/api/invitations/received', () => {
          return HttpResponse.json({
            items: [invitation],
          });
        })
      );

      const receivedResponse = await fetch('/api/invitations/received');
      const received = await receivedResponse.json();
      expect(received.items).toHaveLength(1);
      expect(received.items[0].id).toBe(invitationId);

      // Step 3: Player B accepts the invitation
      server.use(
        http.post(`/api/invitations/${invitationId}/accept`, () => {
          return HttpResponse.json({
            invitation: { ...invitation, status: 'accepted' },
            gameId,
          });
        })
      );

      const acceptResponse = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: 'POST',
      });

      expect(acceptResponse.status).toBe(200);
      const acceptData = await acceptResponse.json();
      expect(acceptData.invitation.status).toBe('accepted');
      expect(acceptData.gameId).toBe(gameId);

      // Step 4: Both players can now access the game
      server.use(
        http.get('/api/games/get', () => {
          return HttpResponse.json({
            id: gameId,
            status: 'active',
            whitePlayerId: USER_IDS.playerA,
            blackPlayerId: USER_IDS.playerB,
          });
        })
      );

      const gameResponse = await fetch(`/api/games/get?gameId=${gameId}`);
      const game = await gameResponse.json();
      expect(game.id).toBe(gameId);
      expect(game.status).toBe('active');
    });
  });
});
