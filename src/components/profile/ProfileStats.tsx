import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rating } from '@/types/chess';
import { Trophy, Swords, Zap, Timer, Brain } from 'lucide-react';

interface ProfileStatsProps {
    ratings?: Rating[];
    totalGames: number;
    winRate: number;
}

export function ProfileStats({ ratings, totalGames, winRate }: ProfileStatsProps) {
    const getIcon = (mode: string) => {
        switch (mode) {
            case 'bullet': return <Zap className="h-4 w-4 text-yellow-500" />;
            case 'blitz': return <Timer className="h-4 w-4 text-red-500" />;
            case 'rapid': return <Swords className="h-4 w-4 text-green-500" />;
            case 'classical': return <Brain className="h-4 w-4 text-blue-500" />;
            default: return <Trophy className="h-4 w-4" />;
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Summary Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalGames}</div>
                    <p className="text-xs text-muted-foreground">
                        {(winRate * 100).toFixed(1)}% Win Rate
                    </p>
                </CardContent>
            </Card>

            {/* Ratings Cards */}
            {ratings?.map((rating) => (
                <Card key={rating.mode}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium capitalize">{rating.mode}</CardTitle>
                        {getIcon(rating.mode)}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rating.elo}</div>
                        <p className="text-xs text-muted-foreground">
                            {rating.gamesPlayed} games played
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
