'use client';

import { Mail, Send } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SentInvitationsList } from '@/components/invitations/SentInvitationsList';

function IncomingPlaceholder() {
  return (
    <div className="rounded-lg border p-6 text-center">
      <p className="font-medium">No invitations received.</p>
      <p className="text-sm text-muted-foreground">When someone invites you, it’ll show up here.</p>
    </div>
  );
}

function IncomingCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Incoming</CardTitle>
            <CardDescription>Invites sent to you</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <IncomingPlaceholder />
      </CardContent>
    </Card>
  );
}

function SentCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Sent</CardTitle>
            <CardDescription>Your invitations and their status</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SentInvitationsList />
      </CardContent>
    </Card>
  );
}

export function InvitationsPanel() {
  return (
    <section aria-label="Invitations" className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Invitations</h2>
        <p className="text-sm text-muted-foreground">Track invites and join once they’re accepted.</p>
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="sent">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>
          <TabsContent value="incoming" className="mt-4">
            <IncomingCard />
          </TabsContent>
          <TabsContent value="sent" className="mt-4">
            <SentCard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: split view */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        <IncomingCard />
        <SentCard />
      </div>
    </section>
  );
}


