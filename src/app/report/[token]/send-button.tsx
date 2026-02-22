"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export function SendReportButton({ token, hasEmail }: { token: string; hasEmail: boolean }) {
    const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [msg, setMsg] = useState("");

    if (!hasEmail) return null;

    const send = async () => {
        setState("sending");
        try {
            const res = await fetch(`/api/report/${token}/email`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setState("sent");
                setMsg(data.message || "Report sent!");
            } else {
                setState("error");
                setMsg(data.error || "Failed to send");
            }
        } catch {
            setState("error");
            setMsg("Network error");
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={send}
                disabled={state === "sending" || state === "sent"}
                className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${state === "sent"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                        : state === "error"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                        : "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30"
                    }
                `}
            >
                {state === "sending" && <Loader2 size={15} className="animate-spin" />}
                {state === "sent"    && <CheckCircle2 size={15} />}
                {(state === "idle" || state === "error") && <Mail size={15} />}
                {state === "sending" ? "Sending..." : state === "sent" ? "Sent!" : "Email Report"}
            </button>
            {msg && (
                <p className={`text-xs ${state === "sent" ? "text-green-400" : "text-red-400"}`}>
                    {msg}
                </p>
            )}
        </div>
    );
}
