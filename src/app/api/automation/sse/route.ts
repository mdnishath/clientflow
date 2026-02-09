import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { automationEvents } from "@/lib/automation/events";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const encoder = new TextEncoder();

    const customStream = new ReadableStream({
        start(controller) {
            const sendEvent = (event: string, data: any) => {
                const text = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(text));
            };

            sendEvent("connected", { message: "SSE Connected" });

            const onResult = (data: any) => {
                if (data.userId === userId) {
                    sendEvent("result", data);
                }
            };

            const onStats = (data: any) => {
                if (data.userId === userId) {
                    sendEvent("stats", data.stats);
                }
            };

            const onComplete = (data: any) => {
                sendEvent("system-complete", data);
            };

            // Lock Updates (Global - sent to everyone)
            const onLockUpdate = (data: any) => {
                sendEvent("lock-update", data); // Broadcast to all
            };

            const onReviewUpdated = (data: any) => {
                sendEvent("review-updated", data); // Broadcast review changes
            };

            automationEvents.on("result", onResult);
            automationEvents.on("stats", onStats);
            automationEvents.on("complete", onComplete);
            automationEvents.on("lock-update", onLockUpdate);
            automationEvents.on("review-updated", onReviewUpdated);

            request.signal.addEventListener("abort", () => {
                automationEvents.off("result", onResult);
                automationEvents.off("stats", onStats);
                automationEvents.off("complete", onComplete);
                automationEvents.off("lock-update", onLockUpdate);
                automationEvents.off("review-updated", onReviewUpdated);
                controller.close();
            });
        },
    });

    return new NextResponse(customStream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
