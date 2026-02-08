"use client";

import { useState, useEffect } from "react";
import { Loader2, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";

interface Review {
    id: string;
    reviewText: string | null;
    reviewLiveLink: string | null;
    emailUsed: string | null;
    status: string;
    dueDate: string | null;
    notes: string | null;
    profile: {
        id: string;
        businessName: string;
    };
}

interface Profile {
    id: string;
    businessName: string;
    client: { name: string };
}

interface ReviewFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review?: Review | null; // If provided, we're editing
    defaultProfileId?: string; // Pre-select profile for new reviews
    onSuccess?: () => void;
}

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "MISSING", label: "Missing" },
    { value: "APPLIED", label: "Applied" },
    { value: "GOOGLE_ISSUE", label: "Google Issue" },
    { value: "LIVE", label: "Live" },
    { value: "DONE", label: "Done" },
];

import { useAuth } from "@/hooks/useAuth";

export function ReviewForm({
    open,
    onOpenChange,
    review,
    defaultProfileId,
    onSuccess,
}: ReviewFormProps) {
    const { can } = useAuth();
    const isEditing = !!review;
    const isReadOnly = isEditing ? !can.editReviews : !can.createReviews;

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [profileId, setProfileId] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [reviewLiveLink, setReviewLiveLink] = useState("");
    const [emailUsed, setEmailUsed] = useState("");
    const [status, setStatus] = useState("PENDING");
    const [dueDate, setDueDate] = useState("");
    const [notes, setNotes] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate AI review text
    const handleGenerateText = async () => {
        const targetProfileId = profileId || defaultProfileId;
        if (!targetProfileId) {
            toast.error("Profile select করুন আগে");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch("/api/reviews/generate/dual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileId: targetProfileId,
                    userHint: notes || undefined, // Use notes as hint if available
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setReviewText(data.french);
                toast.success("✨ AI text generated!");
            } else {
                toast.error("Generation failed");
            }
        } catch (error) {
            console.error("Generate error:", error);
            toast.error("Error generating text");
        } finally {
            setIsGenerating(false);
        }
    };

    // Load profiles for dropdown (skip if defaultProfileId is provided)
    useEffect(() => {
        if (open && !isEditing && !defaultProfileId) {
            fetchProfiles();
        }
    }, [open, isEditing, defaultProfileId]);

    // Populate form when editing
    useEffect(() => {
        if (review) {
            setProfileId(review.profile.id);
            setReviewText(review.reviewText || "");
            setReviewLiveLink(review.reviewLiveLink || "");
            setEmailUsed(review.emailUsed || "");
            setStatus(review.status);
            // Auto-set due date to today if status is PENDING and no due date set
            if (review.status === "PENDING" && !review.dueDate) {
                setDueDate(new Date().toISOString().split("T")[0]);
            } else {
                setDueDate(review.dueDate ? review.dueDate.split("T")[0] : "");
            }
            setNotes(review.notes || "");
        } else {
            // Reset form for new review
            setProfileId(defaultProfileId || "");
            setReviewText("");
            setReviewLiveLink("");
            setEmailUsed("");
            setStatus("PENDING");
            setDueDate(new Date().toISOString().split("T")[0]); // Default to current date
            setNotes("");
        }
    }, [review, open]);

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
        } finally {
            setIsLoadingProfiles(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const targetProfileId = profileId || defaultProfileId;
        if (!isEditing && !targetProfileId) {
            toast.error("Please select a profile");
            return;
        }

        setIsSaving(true);
        try {
            const url = isEditing ? `/api/reviews/${review.id}` : "/api/reviews";
            const method = isEditing ? "PATCH" : "POST";

            const body: Record<string, unknown> = {
                reviewText: reviewText || null,
                reviewLiveLink: reviewLiveLink || null,
                emailUsed: emailUsed || null,
                status,
                dueDate: dueDate || null,
                notes: notes || null,
            };

            if (!isEditing) {
                body.profileId = profileId || defaultProfileId;
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to save review");
            }

            toast.success(isEditing ? "Review updated" : "Review created");
            onOpenChange(false);
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Save error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    // Show email/link fields when status is LIVE or DONE
    const showLiveFields = status === "LIVE" || status === "DONE" || status === "APPLIED";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Edit Review" : "Add New Review"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {isEditing
                                ? `Editing review for ${review.profile.businessName}`
                                : "Create a new review for a GMB profile"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Profile Selector (only for new reviews without default) */}
                        {!isEditing && !defaultProfileId && (
                            <div className="space-y-2">
                                <Label>Profile *</Label>
                                <Select
                                    value={profileId}
                                    onValueChange={setProfileId}
                                    disabled={isSaving || isReadOnly}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue placeholder={isLoadingProfiles ? "Loading..." : "Select profile"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {profiles.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.businessName}
                                                <span className="text-slate-500 text-xs ml-2">
                                                    ({p.client.name})
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={status}
                                onValueChange={setStatus}
                                disabled={isSaving || isReadOnly}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Review Text */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Review Text</Label>
                                {!isReadOnly && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleGenerateText}
                                        disabled={isGenerating || isSaving || (!profileId && !defaultProfileId)}
                                        className="h-7 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/20"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Wand2 className="h-4 w-4 mr-1" />
                                                AI Generate
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="The review content..."
                                rows={4}
                                className="bg-slate-800 border-slate-700 resize-none"
                                disabled={isSaving || isReadOnly}
                            />
                        </div>

                        {/* Live Link & Email (show when LIVE/DONE/APPLIED) */}
                        {showLiveFields && (
                            <>
                                <div className="space-y-2">
                                    <Label>Live Review Link</Label>
                                    <Input
                                        value={reviewLiveLink}
                                        onChange={(e) => setReviewLiveLink(e.target.value)}
                                        placeholder="https://g.co/review/..."
                                        className="bg-slate-800 border-slate-700"
                                        disabled={isSaving || isReadOnly}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Used</Label>
                                    <Input
                                        type="email"
                                        value={emailUsed}
                                        onChange={(e) => setEmailUsed(e.target.value)}
                                        placeholder="reviewer@gmail.com"
                                        className="bg-slate-800 border-slate-700"
                                        disabled={isSaving || isReadOnly}
                                    />
                                    <p className="text-xs text-slate-500">
                                        Email used to post this review on Google
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="bg-slate-800 border-slate-700"
                                disabled={isSaving || isReadOnly}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Internal notes..."
                                rows={2}
                                className="bg-slate-800 border-slate-700 resize-none"
                                disabled={isSaving || isReadOnly}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                            className="text-slate-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        {!isReadOnly && (
                            <Button
                                type="submit"
                                disabled={isSaving || (!isEditing && !profileId && !defaultProfileId)}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    isEditing ? "Update Review" : "Create Review"
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
