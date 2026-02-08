import Link from "next/link";
import {
    ExternalLink,
    MoreHorizontal,
    Archive,
    RotateCcw,
    Trash2,
    Star,
    Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Profile {
    id: string;
    businessName: string;
    gmbLink: string | null;
    category: string | null;
    isArchived: boolean;
    createdAt?: string | Date;
    client?: {
        id: string;
        name: string;
    };
    reviewCount?: number;
    _count?: { reviews: number };
    liveCount?: number;
    reviewOrdered?: number;
}

interface ProfileCardProps {
    profile: Profile;
    isSelected?: boolean;
    onToggleSelect?: (id: string) => void;
    showClientName?: boolean;
    onArchive?: (profile: Profile) => void;
    onRestore?: (profile: Profile) => void;
    onDelete?: (profile: Profile) => void;
    isAdmin?: boolean;
}

export function ProfileCard({
    profile,
    isSelected,
    onToggleSelect,
    showClientName = false,
    onArchive,
    onRestore,
    onDelete,
    isAdmin = false,
}: ProfileCardProps) {
    const reviewCount = profile.reviewCount ?? profile._count?.reviews ?? 0;
    const liveCount = profile.liveCount ?? 0;
    const reviewOrdered = profile.reviewOrdered ?? 0;

    return (
        <Card
            className={`bg-slate-800/50 border-slate-700 transition-all hover:border-slate-600 ${profile.isArchived ? "opacity-70 border-dashed" : ""
                } ${isSelected ? "ring-2 ring-indigo-500 bg-slate-800" : ""}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {onToggleSelect && (
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleSelect(profile.id)}
                            className="mt-1"
                        />
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <Link
                                    href={`/profiles/${profile.id}`}
                                    className="group block"
                                >
                                    <h3 className="font-bold text-white mb-1 truncate group-hover:text-indigo-400 transition-colors">
                                        {profile.businessName}
                                    </h3>
                                </Link>

                                {showClientName && profile.client && (
                                    <p className="text-xs text-slate-400 mb-1">
                                        {profile.client.name}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {profile.category && (
                                        <Badge variant="secondary" className="bg-slate-700 text-xs hover:bg-slate-600">
                                            {profile.category}
                                        </Badge>
                                    )}
                                    {profile.isArchived && (
                                        <Badge variant="outline" className="text-orange-500 text-xs border-orange-500/30">
                                            Archived
                                        </Badge>
                                    )}
                                    {reviewOrdered > 0 && (
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${liveCount >= reviewOrdered
                                                ? 'text-green-400 border-green-400/50'
                                                : 'text-blue-400 border-blue-400/50'
                                                }`}
                                        >
                                            {liveCount >= reviewOrdered
                                                ? '✓ Filled'
                                                : `${liveCount}/${reviewOrdered}`
                                            }
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {profile.gmbLink && (
                                <a
                                    href={profile.gmbLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                    <Star className="h-3.5 w-3.5 text-indigo-400" />
                                    {reviewCount} Reviews
                                </span>
                            </div>

                            <Link href={`/profiles/${profile.id}`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                                >
                                    View Details
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {(isAdmin || onArchive || onDelete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-8 w-8 -mt-1 -mr-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200">
                                {profile.isArchived ? (
                                    onRestore && (
                                        <DropdownMenuItem onClick={() => onRestore(profile)} className="focus:bg-slate-700 cursor-pointer">
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Restore
                                        </DropdownMenuItem>
                                    )
                                ) : (
                                    onArchive && (
                                        <DropdownMenuItem onClick={() => onArchive(profile)} className="focus:bg-slate-700 cursor-pointer">
                                            <Archive className="mr-2 h-4 w-4" />
                                            Archive
                                        </DropdownMenuItem>
                                    )
                                )}
                                {(onArchive || onRestore) && onDelete && <DropdownMenuSeparator className="bg-slate-700" />}
                                {onDelete && (
                                    <DropdownMenuItem
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                        onClick={() => onDelete(profile)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Permanently
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
