"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface ReviewGeneratorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface Profile {
    id: string;
    businessName: string;
    client: { name: string };
}

export function ReviewGeneratorModal({
    open,
    onOpenChange,
    onSuccess,
}: ReviewGeneratorModalProps) {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string>("");
    const [quantity, setQuantity] = useState<number[]>([1]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

    useEffect(() => {
        if (open) {
            fetchProfiles();
            setSelectedProfileId("");
            setQuantity([1]);
        }
    }, [open]);

    const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        try {
            const res = await fetch("/api/profiles");
            if (res.ok) {
                const data = await res.json();
                setProfiles(data);
            }
        } catch (error) {
            console.error("Failed to fetch profiles:", error);
            toast.error("Failed to load profiles");
        } finally {
            setIsLoadingProfiles(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedProfileId) return;

        setIsGenerating(true);
        try {
            const res = await fetch("/api/reviews/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileId: selectedProfileId,
                    quantity: quantity[0],
                    style: "detailed"
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Generation failed");
            }

            const data = await res.json();
            toast.success(`Generated ${data.count} review${data.count !== 1 ? 's' : ''} successfully!`);

            onOpenChange(false);
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Generate error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to generate reviews");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        Generate AI Reviews
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Select a profile and choose how many reviews to generate.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="profile">Target Profile</Label>
                        <Select
                            value={selectedProfileId}
                            onValueChange={setSelectedProfileId}
                            disabled={isGenerating || isLoadingProfiles}
                        >
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                                <SelectValue placeholder={isLoadingProfiles ? "Loading..." : "Select a profile"} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {profiles.length === 0 && !isLoadingProfiles ? (
                                    <SelectItem value="__no_profiles__" disabled>No profiles found</SelectItem>
                                ) : (
                                    profiles.map((profile) => (
                                        <SelectItem key={profile.id} value={profile.id}>
                                            {profile.businessName}
                                            <span className="text-slate-500 text-xs ml-2">
                                                ({profile.client.name})
                                            </span>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>Quantity</Label>
                            <span className="text-sm font-medium text-indigo-400">
                                {quantity[0]} Review{quantity[0] > 1 ? "s" : ""}
                            </span>
                        </div>
                        <Slider
                            value={quantity}
                            onValueChange={setQuantity}
                            max={5}
                            min={1}
                            step={1}
                            className="py-4"
                            disabled={isGenerating}
                        />
                        <p className="text-xs text-slate-500">
                            Reviews will be saved as drafts for your review.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isGenerating}
                        className="text-slate-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={!selectedProfileId || isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
