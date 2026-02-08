"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
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

interface GmbProfile {
    id: string;
    businessName: string;
    gmbLink: string | null;
    category: string | null;
    reviewLimit: number | null;
    reviewsStartDate: string | null;
    reviewOrdered: number;
}

interface CategoryOption {
    slug: string;
    name: string;
    icon: string | null;
}

interface ProfileFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId?: string;
    profile?: GmbProfile | null;
    onSuccess: () => void;
}

import { useAuth } from "@/hooks/useAuth";

export function ProfileForm({
    open,
    onOpenChange,
    clientId,
    profile,
    onSuccess,
}: ProfileFormProps) {
    const { can } = useAuth();
    const [businessName, setBusinessName] = useState("");
    const [gmbLink, setGmbLink] = useState("");
    const [category, setCategory] = useState("__none__");
    const [reviewLimit, setReviewLimit] = useState("");
    const [reviewsStartDate, setReviewsStartDate] = useState("");
    const [reviewOrdered, setReviewOrdered] = useState("");
    const [autoCreateReviews, setAutoCreateReviews] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const isReadOnly = !can.editProfiles;

    // Categories from API
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    const isEditing = !!profile;

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories?activeOnly=true");
            if (res.ok) {
                const data = await res.json();
                setCategories(data.map((c: { slug: string; name: string; icon: string | null }) => ({
                    slug: c.slug,
                    name: c.name,
                    icon: c.icon
                })));
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    // Reset form when profile changes or dialog opens
    useEffect(() => {
        if (open && profile) {
            setBusinessName(profile.businessName || "");
            setGmbLink(profile.gmbLink || "");
            setCategory(profile.category || "__none__");
            setReviewLimit(profile.reviewLimit ? profile.reviewLimit.toString() : "");
            setReviewsStartDate(
                profile.reviewsStartDate
                    ? new Date(profile.reviewsStartDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
            );
            setReviewOrdered(profile.reviewOrdered !== null && profile.reviewOrdered !== undefined ? profile.reviewOrdered.toString() : "0");
        } else if (open) {
            resetForm();
        }
    }, [open, profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const url = isEditing ? `/api/profiles/${profile.id}` : "/api/profiles";
            const method = isEditing ? "PATCH" : "POST";

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const body: any = {
                businessName,
                gmbLink,
                category: category === "__none__" ? null : category,
                reviewLimit: reviewLimit ? parseInt(reviewLimit) : null,
                reviewsStartDate: reviewsStartDate ? new Date(reviewsStartDate) : null,
                reviewOrdered: reviewOrdered ? parseInt(reviewOrdered) : 0,
                autoCreateReviews: !isEditing ? autoCreateReviews : undefined,
            };

            if (!isEditing && clientId) {
                body.clientId = clientId;
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save profile");
            }

            onSuccess();
            onOpenChange(false);
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setBusinessName("");
        setGmbLink("");
        setCategory("__none__");
        setReviewLimit("");
        setReviewsStartDate(new Date().toISOString().split("T")[0]);
        setReviewOrdered("");
        setError("");
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                onOpenChange(open);
                if (!open) resetForm();
            }}
        >
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit GMB Profile" : "Add New GMB Profile"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="businessName" className="text-slate-200">
                            Business Name *
                        </Label>
                        <Input
                            id="businessName"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Alex's Pizza NYC"
                            required
                            className="bg-slate-700/50 border-slate-600 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-slate-200">
                            Category
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Select a category..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="__none__">No Category</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.slug} value={cat.slug}>
                                        {cat.icon && `${cat.icon} `}{cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="reviewOrdered" className="text-slate-200">
                                Reviews Ordered
                            </Label>
                            <Input
                                id="reviewOrdered"
                                type="number"
                                min="0"
                                value={reviewOrdered}
                                onChange={(e) => setReviewOrdered(e.target.value)}
                                placeholder="e.g. 10"
                                className="bg-slate-700/50 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reviewLimit" className="text-slate-200">
                                Daily Limit
                            </Label>
                            <Input
                                id="reviewLimit"
                                type="number"
                                min="1"
                                value={reviewLimit}
                                onChange={(e) => setReviewLimit(e.target.value)}
                                placeholder="e.g. 5"
                                className="bg-slate-700/50 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reviewsStartDate" className="text-slate-200">
                                Start Date
                            </Label>
                            <Input
                                id="reviewsStartDate"
                                type="date"
                                value={reviewsStartDate}
                                onChange={(e) => setReviewsStartDate(e.target.value)}
                                className="bg-slate-700/50 border-slate-600 text-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gmbLink" className="text-slate-200">
                            GMB Link
                        </Label>
                        <Input
                            id="gmbLink"
                            value={gmbLink}
                            onChange={(e) => setGmbLink(e.target.value)}
                            placeholder="https://g.page/..."
                            className="bg-slate-700/50 border-slate-600 text-white"
                        />
                    </div>

                    {!isEditing && reviewOrdered && parseInt(reviewOrdered) > 0 && (
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="autoCreateReviews"
                                checked={autoCreateReviews}
                                onCheckedChange={(checked) => setAutoCreateReviews(checked as boolean)}
                                className="border-slate-500"
                            />
                            <Label htmlFor="autoCreateReviews" className="text-sm font-normal text-slate-300 cursor-pointer">
                                Auto-create {reviewOrdered} pending reviews for this profile
                            </Label>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Add Profile"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
