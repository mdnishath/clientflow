"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
    text: string;
    className?: string;
    variant?: "ghost" | "outline" | "default";
    size?: "sm" | "default" | "lg" | "icon";
    label?: string;
    showLabel?: boolean;
}

export function CopyButton({
    text,
    className,
    variant = "ghost",
    size = "sm",
    label = "Copy",
    showLabel = false,
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={cn(
                "transition-all duration-200",
                copied && "text-green-400 hover:text-green-300",
                className
            )}
            title={copied ? "Copied!" : label}
        >
            {copied ? (
                <>
                    <Check size={14} className="text-green-400" />
                    {showLabel && <span className="ml-1 text-green-400">Copied!</span>}
                </>
            ) : (
                <>
                    <Copy size={14} />
                    {showLabel && <span className="ml-1">{label}</span>}
                </>
            )}
        </Button>
    );
}
