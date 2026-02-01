'use client';

import { useState, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AvatarUploadProps {
    currentUrl?: string;
    onUploadComplete: (url: string) => void;
    username: string;
}

export function AvatarUpload({ currentUrl, onUploadComplete, username }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File too large", {
                description: "Image must be less than 2MB",
            });
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error("Invalid file type", {
                description: "Please upload an image file",
            });
            return;
        }

        setIsUploading(true);
        const supabase = getSupabaseClient();
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            onUploadComplete(publicUrl);
            toast.success("Avatar updated", {
                description: "Your profile picture has been updated successfully.",
            });

        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error("Upload failed", {
                description: "There was an error uploading your avatar. Please try again.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={currentUrl} alt={username} className="object-cover" />
                    <AvatarFallback className="text-4xl">
                        {username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
            </div>

            <div className="text-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Picture
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max 2MB.
                </p>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
}
