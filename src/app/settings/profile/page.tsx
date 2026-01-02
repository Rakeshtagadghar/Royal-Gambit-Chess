'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming this exists or I'll use textarea
import { Switch } from '@/components/ui/switch'; // Check if exists, otherwise checkbox
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ProfileSettingsPage() {
    const { user, profile, setProfile } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        bio: '',
        countryCode: '',
        isProfilePublic: true,
        isActivityPublic: true,
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || '',
                displayName: profile.displayName || '',
                bio: profile.bio || '',
                countryCode: profile.countryCode || '',
                isProfilePublic: profile.isProfilePublic ?? true,
                isActivityPublic: profile.isActivityPublic ?? true,
            });
        }
    }, [profile]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        const supabase = getSupabaseClient();

        try {
            const updates = {
                id: user.id,
                // Include username if we are creating a new profile (username input enabled)
                // If profile exists (username disabled), we shouldn't really update it, but sending it matches if consistent.
                // Better: only include it if we don't have a profile yet or explicitly allowing change.
                ...(formData.username ? { username: formData.username } : {}),
                display_name: formData.displayName,
                bio: formData.bio,
                country_code: formData.countryCode,
                is_profile_public: formData.isProfilePublic,
                is_activity_public: formData.isActivityPublic,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('profiles')
                .upsert(updates)
                .select()
                .single();

            if (error) throw error;

            // Update local state
            if (data) {
                const newProfile = profile ? { ...profile } : {
                    id: user.id,
                    username: data.username,
                    createdAt: data.created_at,
                };

                setProfile({
                    ...newProfile,
                    displayName: data.display_name,
                    bio: data.bio,
                    countryCode: data.country_code,
                    isProfilePublic: data.is_profile_public,
                    isActivityPublic: data.is_activity_public,
                    avatarUrl: data.avatar_url || profile?.avatarUrl,
                });
            }

            toast.success('Profile updated successfully');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

            <div className="grid gap-6">
                {/* Avatar Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>Click to upload a new avatar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AvatarUpload
                            username={profile?.username || 'User'}
                            currentUrl={profile?.avatarUrl}
                            onUploadComplete={(url) => {
                                if (profile) setProfile({ ...profile, avatarUrl: url });
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Identity Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Identity</CardTitle>
                        <CardDescription>How you appear to others</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    disabled={!!profile?.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    className={!!profile?.username ? "bg-muted" : ""}
                                />
                                <p className="text-xs text-muted-foreground">Usernames cannot be changed freely.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    maxLength={30}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <textarea
                                    id="bio"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    maxLength={280}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="countryCode">Country Code (ISO-2)</Label>
                                <Input
                                    id="countryCode"
                                    value={formData.countryCode}
                                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase().slice(0, 2) })}
                                    maxLength={2}
                                    placeholder="US"
                                    className="w-20"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Identity
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Privacy Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Privacy</CardTitle>
                        <CardDescription>Manage who can see your profile</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="public-profile" className="flex flex-col space-y-1">
                                <span>Public Profile</span>
                                <span className="font-normal text-xs text-muted-foreground">Allow anyone to view your profile page.</span>
                            </Label>
                            <Button
                                variant={formData.isProfilePublic ? "default" : "outline"}
                                onClick={() => {
                                    // Assuming instant update or bundled with save?
                                    // Let's bundle with Save Identity or require separate save?
                                    // I'll implement immediate toggle or bundled. Bundled is easier with form state.
                                    setFormData(p => ({ ...p, isProfilePublic: !p.isProfilePublic }));
                                }}
                            >
                                {formData.isProfilePublic ? 'On' : 'Off'}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="public-activity" className="flex flex-col space-y-1">
                                <span>Public Activity</span>
                                <span className="font-normal text-xs text-muted-foreground">Show your recent games on your profile.</span>
                            </Label>
                            <Button
                                variant={formData.isActivityPublic ? "default" : "outline"}
                                onClick={() => {
                                    setFormData(p => ({ ...p, isActivityPublic: !p.isActivityPublic }));
                                }}
                            >
                                {formData.isActivityPublic ? 'On' : 'Off'}
                            </Button>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleUpdate} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Privacy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
