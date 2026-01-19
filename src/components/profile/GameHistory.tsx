import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}

export interface MatchResult {
    game_id: string;
    player_white: string;
    player_black: string;
    winner_user_id: string | null;
    result: string;
    mode: string;
    ended_at: string;
}

interface GameHistoryProps {
    games: MatchResult[];
    currentUserId: string;
}

export function GameHistory({ games, currentUserId }: GameHistoryProps) {
    if (games.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Games</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No recent games found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Games</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                        {games.map((game) => {
                            const isWhite = game.player_white === currentUserId;
                            const isWin = game.winner_user_id === currentUserId;
                            const isDraw = game.result === 'draw';
                            const resultText = isWin ? 'Won' : isDraw ? 'Draw' : 'Lost';

                            return (
                                <div key={game.game_id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex flex-col">
                                        <span className="font-medium capitalize">{game.mode}</span>
                                        <span className="text-xs text-muted-foreground">v.s. {isWhite ? 'Black' : 'White'}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={cn(
                                            "font-bold",
                                            isWin ? "text-green-500" : isDraw ? "text-yellow-500" : "text-red-500"
                                        )}>
                                            {resultText}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTimeAgo(game.ended_at)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
