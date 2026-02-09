"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AutoFillButton() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAutoFill = async () => {
        if (!confirm("Auto-generate pending reviews for all profiles?\n\nThis will create reviews based on: reviewOrdered - liveCount")) {
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch("/api/reviews/generate/bulk-auto", {
                method: "POST",
            });

            const data = await res.json();

            if (res.ok && data.success) {
                const { reviewsCreated, profilesWithReviews } = data.summary;

                if (reviewsCreated > 0) {
                    toast.success(`✅ Generated ${reviewsCreated} reviews across ${profilesWithReviews} profiles!`);
                    // Refresh the page to update stats
                    window.location.reload();
                } else {
                    toast.info("No reviews needed - all profiles are up to date!");
                }
            } else {
                toast.error(data.error || "Failed to generate reviews");
            }
        } catch (error) {
            console.error("Auto-fill error:", error);
            toast.error("Error generating reviews. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            onClick={handleAutoFill}
            disabled={isGenerating}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Zap className="mr-2 h-4 w-4" />
                    Auto-Fill All Profiles
                </>
            )}
        </Button>
    );
}
