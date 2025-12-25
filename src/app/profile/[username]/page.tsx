'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Profile } from '@/types/chess';
import { 
  User, 
  Trophy, 
  Calendar,
  Gamepad2,
  TrendingUp,
  Loader2 
} from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user, profile: currentUserProfile } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
  });

  const isOwnProfile = currentUserProfile?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        
        // Map database snake_case to camelCase
        setProfile({
          id: profileData.id,
          username: profileData.username,
          displayName: profileData.display_name,
          avatarUrl: profileData.avatar_url,
          createdAt: profileData.created_at,
        });

        // Fetch game stats
        const { data: games, error: gamesError } = await supabase
          .from('games')
          .select('result, white_id, black_id')
          .or(`white_id.eq.${profileData.id},black_id.eq.${profileData.id}`)
          .eq('status', 'finished');

        if (!gamesError && games) {
          let wins = 0, losses = 0, draws = 0;
          games.forEach((game: { result: string; white_id: string; black_id: string }) => {
            const isWhite = game.white_id === profileData.id;
            if (game.result === '1/2-1/2') {
              draws++;
            } else if ((game.result === '1-0' && isWhite) || (game.result === '0-1' && !isWhite)) {
              wins++;
            } else {
              losses++;
            }
          });
          
          const gamesPlayed = wins + losses + draws;
          const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
          
          setStats({ gamesPlayed, wins, losses, draws, winRate });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground">The user @{username} doesn't exist</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                  <AvatarFallback className="text-3xl">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-3xl font-bold">
                    {profile.displayName || profile.username}
                  </h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                  {profile.createdAt && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <Button variant="outline" asChild>
                    <a href="/settings">Edit Profile</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Gamepad2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
                <p className="text-sm text-muted-foreground">Games</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-green-500">{stats.wins}</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="h-6 w-6 mx-auto mb-2 text-lg">💔</div>
                <p className="text-2xl font-bold text-red-500">{stats.losses}</p>
                <p className="text-sm text-muted-foreground">Losses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{stats.winRate}%</p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Tabs */}
          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent Games</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.gamesPlayed === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No games played yet
                    </p>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Game history coming soon...
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Game Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Games</span>
                      <span className="font-bold">{stats.gamesPlayed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Wins</span>
                      <span className="font-bold text-green-500">{stats.wins}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Losses</span>
                      <span className="font-bold text-red-500">{stats.losses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Draws</span>
                      <span className="font-bold text-yellow-500">{stats.draws}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between items-center">
                      <span>Win Rate</span>
                      <span className="font-bold text-primary">{stats.winRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}

