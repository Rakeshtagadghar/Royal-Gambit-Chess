'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RoomInfo = {
  room: { id: string; game_id: string; created_by: string; created_at: string } | null;
  role: 'player1' | 'player2' | 'spectator';
  opponentUserId: string | null;
  can_publish_signaling: boolean;
  is_initiator: boolean;
};

type CallState = 'idle' | 'requesting_media' | 'connecting' | 'connected' | 'ended' | 'error';

export function VideoCallPanel(props: { gameId: string; className?: string }) {
  const { gameId, className } = props;

  const supabase = useMemo(() => getSupabaseClient(), []);
  const [state, setState] = useState<CallState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const roomRef = useRef<RoomInfo | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const cleanup = async () => {
    try {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    } catch {}

    try {
      peerRef.current?.destroy();
    } catch {}
    peerRef.current = null;

    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    localStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCall = async () => {
    setError(null);
    setState('requesting_media');

    try {
      const roomResp = await fetch('/api/rtc/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });
      const roomJson = (await roomResp.json().catch(() => ({}))) as Partial<RoomInfo> & {
        error?: string;
      };
      if (!roomResp.ok) throw new Error(roomJson?.error || 'Failed to get RTC room');

      const room = roomJson as RoomInfo;
      roomRef.current = room;

      if (!room.can_publish_signaling || !room.room?.id || !room.opponentUserId) {
        throw new Error('RTC is only available to the two players in this game');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Ensure current mic/cam state is applied
      stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
      stream.getVideoTracks().forEach((t) => (t.enabled = camOn));

      setState('connecting');

      // Subscribe to signaling channel
      const channelName = `rtc:game:${gameId}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'broadcast',
          { event: 'signal' },
          (evt: { payload?: { roomId: string; fromUserId: string; signal: Peer.SignalData } }) => {
            const payload = evt?.payload;
          const current = roomRef.current;
          if (!payload || !current?.room?.id) return;
          if (payload.roomId !== current.room.id) return;
          if (payload.fromUserId !== current.opponentUserId) return;
          try {
            peerRef.current?.signal(payload.signal);
          } catch {
            // ignore
          }
          }
        )
        .subscribe();
      channelRef.current = channel;

      const peer = new Peer({
        initiator: room.is_initiator,
        trickle: true,
        stream,
      });
      peerRef.current = peer;

      peer.on('signal', async (data: Peer.SignalData) => {
        const current = roomRef.current;
        if (!current?.room?.id || !current.opponentUserId) return;
        try {
          await fetch('/api/rtc/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameId,
              roomId: current.room.id,
              toUserId: current.opponentUserId,
              signal: data,
            }),
          });
        } catch {
          // ignore - best effort
        }
      });

      peer.on('connect', () => {
        setState('connected');
      });

      peer.on('stream', (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peer.on('error', (err: Error) => {
        console.error('peer error', err);
        setError('Call error. Try restarting the call.');
        setState('error');
      });

      peer.on('close', () => {
        setState('ended');
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start call';
      setError(msg);
      setState('error');
      await cleanup();
    }
  };

  const endCall = async () => {
    setState('ended');
    await cleanup();
  };

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
  };

  const toggleCam = () => {
    const next = !camOn;
    setCamOn(next);
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-medium">Video</div>
          <Badge variant={state === 'connected' ? 'default' : 'secondary'}>{state}</Badge>
        </div>
        {state === 'idle' || state === 'error' || state === 'ended' ? (
          <Button onClick={startCall}>Start</Button>
        ) : (
          <Button variant="destructive" onClick={endCall}>
            End
          </Button>
        )}
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Remote</div>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black aspect-video"
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">You</div>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg bg-black aspect-video"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={toggleMic} disabled={state === 'idle'}>
          {micOn ? 'Mute' : 'Unmute'}
        </Button>
        <Button variant="outline" onClick={toggleCam} disabled={state === 'idle'}>
          {camOn ? 'Camera off' : 'Camera on'}
        </Button>
      </div>
    </div>
  );
}


