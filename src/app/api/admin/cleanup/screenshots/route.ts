import { requireRole } from "@/lib/rbac";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// DELETE /api/admin/cleanup/screenshots - Delete all screenshots
export async function DELETE() {
    const error = await requireRole(["ADMIN"]);
    if (error) return error;

    try {
        const screenshotsDir = path.join(process.cwd(), "public", "screenshots");

        // Check if directory exists
        if (!fs.existsSync(screenshotsDir)) {
            return NextResponse.json({
                success: true,
                deleted: 0,
                message: "Screenshots folder does not exist",
            });
        }

        // Get all files in directory
        const files = fs.readdirSync(screenshotsDir);
        let deletedCount = 0;

        for (const file of files) {
            // Skip hidden files and non-image files
            if (file.startsWith(".")) continue;

            const filePath = path.join(screenshotsDir, file);

            // Only delete files, not directories
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                deletedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            deleted: deletedCount,
            message: `${deletedCount} screenshots deleted`,
        });
    } catch (error) {
        console.error("Failed to delete screenshots:", error);
        return NextResponse.json(
            { error: "Failed to delete screenshots" },
            { status: 500 }
        );
    }
}
