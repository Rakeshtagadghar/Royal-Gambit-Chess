import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { GameHistory } from '@/components/profile/GameHistory';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';
import NextLink from 'next/link';
import { Rating } from '@/types/chess';

interface PageProps {
    params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
    const { username } = await params;
    const supabase = await createClient();

    // 1. Get current user (viewer)
    const {
        data: { user: currentUser },
    } = await supabase.auth.getUser();

    // 2. Fetch profile summary
    // We fetch by username. Ensure username is case-insensitive if needed, 
    // but for now strict match or lowercase normalized.
    const { data: profile, error: profileError } = await supabase
        .from('v_profile_summary')
        .select('*')
        .eq('username', username)
        .single();

    if (profileError || !profile) {
        if (username === 'me' && currentUser) {
            // Redirect /u/me to actual username? Or handle it.
            // For now, 404.
        }
        notFound();
    }

    const isOwner = currentUser?.id === profile.id;
    const isProfilePublic = profile.is_profile_public;

    // 3. Privacy Check
    if (!isProfilePublic && !isOwner) {
        return (
            <div className="container mx-auto max-w-4xl py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 opacity-50">
                        <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold">This profile is private</h1>
                    <p className="text-muted-foreground">The user has chosen to keep their profile hidden.</p>
                    {currentUser ? (
                        <Button variant="outline" asChild>
                            <NextLink href="/">Go Home</NextLink>
                        </Button>
                    ) : (
                        <Button asChild>
                            <NextLink href="/login">Sign In</NextLink>
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // 4. Fetch Ratings
    const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', profile.id);

    // Map ratings to type
    const ratings: Rating[] = ratingsData?.map((r: any) => ({
        userId: r.user_id,
        mode: r.mode,
        elo: r.elo,
        gamesPlayed: r.games_played,
        wins: r.wins,
        losses: r.losses,
        draws: r.draws,
        updatedAt: r.updated_at
    })) || [];

    // 5. Fetch Activity (if public or owner)
    const isActivityPublic = profile.is_activity_public;
    let games: any[] = [];

    if (isActivityPublic || isOwner) {
        const { data: gamesData } = await supabase
            .from('match_results')
            .select('*')
            .or(`player_white.eq.${profile.id},player_black.eq.${profile.id}`)
            .order('ended_at', { ascending: false })
            .limit(20);

        games = gamesData || [];
    }

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 mb-8 items-center md:items-start">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={profile.avatar_url} alt={profile.username} className="object-cover" />
                    <AvatarFallback className="text-4xl">
                        {profile.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
                        {profile.country_code && (
                            <span className="text-xl" title={profile.country_code}>
                                {getFlagEmoji(profile.country_code)}
                            </span>
                        )}
                    </div>
                    <p className="text-xl text-muted-foreground">@{profile.username}</p>

                    {profile.bio && (
                        <p className="max-w-md mx-auto md:mx-0 text-sm">{profile.bio}</p>
                    )}

                    <div className="pt-2 text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-4">
                        <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                        {isOwner && (
                            <NextLink href="/settings/profile" className="text-primary hover:underline flex items-center gap-1">
                                Edit Profile
                            </NextLink>
                        )}
                    </div>
                </div>
            </div>

            {/* Ratings */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Ratings</h2>
                <ProfileStats
                    ratings={ratings}
                    totalGames={profile.total_games}
                    winRate={profile.win_rate}
                />
            </div>

            {/* Activity */}
            {(isActivityPublic || isOwner) && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Recent Actvity</h2>
                    <GameHistory games={games} currentUserId={profile.id} />
                </div>
            )}

            {!isActivityPublic && !isOwner && (
                <div className="text-center py-8 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">Recent activity is hidden.</p>
                </div>
            )}
        </div>
    );
}

// Helper for flag emoji
function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
