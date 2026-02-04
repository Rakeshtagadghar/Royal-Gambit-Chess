'use client';

import { useTranslations } from 'next-intl';
import { Mail, Send } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SentInvitationsList } from '@/components/invitations/SentInvitationsList';

function IncomingPlaceholder() {
  const t = useTranslations('invitations');
  return (
    <div className="rounded-lg border p-6 text-center">
      <p className="font-medium">{t('noInvitations')}</p>
      <p className="text-sm text-muted-foreground">{t('noInvitationsDesc')}</p>
    </div>
  );
}

function IncomingCard() {
  const t = useTranslations('invitations');
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>{t('incoming')}</CardTitle>
            <CardDescription>{t('sentInvites')}</CardDescription>
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
  const t = useTranslations('invitations');
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>{t('sent')}</CardTitle>
            <CardDescription>{t('sentInvitesDesc')}</CardDescription>
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
  const t = useTranslations('invitations');
  return (
    <section aria-label={t('title')} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('trackInvites')}</p>
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="sent">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming">{t('incoming')}</TabsTrigger>
            <TabsTrigger value="sent">{t('sent')}</TabsTrigger>
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
