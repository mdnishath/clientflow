"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, QrCode, Copy, Mail } from "lucide-react";
import { toast } from "sonner";

interface QRCodeModalProps {
    profileId: string | null;
    businessName?: string;
    onClose: () => void;
}

export function QRCodeModal({ profileId, businessName, onClose }: QRCodeModalProps) {
    const [qrData, setQrData] = useState<{ qr: string; link: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [reviewEmail, setReviewEmail] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        if (!profileId) return;
        setLoading(true);
        fetch(`/api/profiles/${profileId}/qr?format=base64`)
            .then(r => r.json())
            .then(data => {
                if (data.qr) setQrData(data);
                else toast.error(data.error || "Failed to load QR code");
            })
            .catch(() => toast.error("Failed to load QR code"))
            .finally(() => setLoading(false));
    }, [profileId]);

    const downloadQR = (format: "png" | "svg") => {
        if (!profileId) return;
        const a = document.createElement("a");
        a.href = `/api/profiles/${profileId}/qr?format=${format}`;
        a.download = `${businessName || "qr"}-qr.${format}`;
        a.click();
        toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    };

    const copyLink = () => {
        if (qrData?.link) {
            navigator.clipboard.writeText(qrData.link);
            toast.success("GMB link copied!");
        }
    };

    const sendReviewRequest = async () => {
        if (!reviewEmail || !profileId) return;
        setSendingEmail(true);
        try {
            const res = await fetch("/api/email/send-review-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profileId, customerEmail: reviewEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Review request email sent!");
                setReviewEmail("");
            } else {
                toast.error(data.error || "Failed to send email");
            }
        } catch {
            toast.error("Failed to send email");
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <Dialog open={!!profileId} onOpenChange={() => onClose()}>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <QrCode size={20} className="text-indigo-400" />
                        QR Code — {businessName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* QR Code display */}
                    <div className="bg-white rounded-xl p-4 flex items-center justify-center min-h-[220px]">
                        {loading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        ) : qrData?.qr ? (
                            <img src={qrData.qr} alt="QR Code" className="w-48 h-48" />
                        ) : (
                            <p className="text-slate-500 text-sm text-center">No GMB link set for this profile</p>
                        )}
                    </div>

                    {qrData && (
                        <>
                            {/* GMB link */}
                            <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-2">
                                <p className="text-xs text-slate-400 flex-1 truncate">{qrData.link}</p>
                                <Button variant="ghost" size="sm" onClick={copyLink} className="h-7 w-7 p-0 text-slate-400 hover:text-white">
                                    <Copy size={14} />
                                </Button>
                            </div>

                            {/* Download buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                                    onClick={() => downloadQR("png")}
                                >
                                    <Download size={15} className="mr-2" />
                                    PNG
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                                    onClick={() => downloadQR("svg")}
                                >
                                    <Download size={15} className="mr-2" />
                                    SVG
                                </Button>
                            </div>

                            {/* Send review request by email */}
                            <div className="border-t border-slate-700 pt-4">
                                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                    <Mail size={12} />
                                    Send review request to customer
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="customer@email.com"
                                        value={reviewEmail}
                                        onChange={(e) => setReviewEmail(e.target.value)}
                                        className="flex-1 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                                        onKeyDown={(e) => e.key === "Enter" && sendReviewRequest()}
                                    />
                                    <Button
                                        onClick={sendReviewRequest}
                                        disabled={!reviewEmail || sendingEmail}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3"
                                        size="sm"
                                    >
                                        {sendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
