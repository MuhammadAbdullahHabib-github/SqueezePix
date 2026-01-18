'use client';

import { useState } from 'react';
import { usePipelineStore } from '@/stores/pipeline-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useLicense } from '@/hooks/use-license';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/features/upgrade-modal';
import { SubscriptionStatus } from '@/components/features/subscription-status';
import { cn } from '@/lib/utils';
import { FileJson, FileSpreadsheet, Sparkles, Zap, Crown } from 'lucide-react';

export function SidebarRight() {
    const steps = usePipelineStore((state) => state.steps);
    const updateStepSettings = usePipelineStore((state) => state.updateStepSettings);
    const { isPro, tier } = useLicense();

    const includeMetadataJson = useSettingsStore((state) => state.includeMetadataJson);
    const includeMetadataCsv = useSettingsStore((state) => state.includeMetadataCsv);
    const toggleMetadataJson = useSettingsStore((state) => state.toggleMetadataJson);
    const toggleMetadataCsv = useSettingsStore((state) => state.toggleMetadataCsv);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const altTextStep = steps.find((s) => s.type === 'altText');
    const keywords = altTextStep?.settings?.keywords || [];

    // Since store keeps array, we join for display
    const keywordsStr = keywords.join(', ');

    return (
        <div className="flex h-full flex-col gap-8">
            {/* AI Alt Text */}
            <div className={cn("space-y-4", !altTextStep?.enabled && "opacity-50 pointer-events-none")}>
                <h3 className="text-sm font-semibold">AI Alt Text Settings</h3>
                <div className="space-y-3">
                    <label className="text-xs text-muted-foreground">Keywords (optional)</label>
                    <Input
                        placeholder="e.g., red sneakers nike"
                        value={keywordsStr}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            updateStepSettings(altTextStep?.id!, { keywords: e.target.value.split(',').map((s: string) => s.trim()) })
                        }}
                        disabled={!altTextStep?.enabled}
                    />
                    <div className="flex gap-2 rounded-md bg-muted/50 p-2">
                        <span className="text-xs text-muted-foreground">💡</span>
                        <p className="text-xs text-muted-foreground">
                            AI will incorporate these keywords naturally into generated descriptions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Export Settings */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold">Export Settings</h3>
                <p className="text-xs text-muted-foreground">Include with ZIP download:</p>
                <div className="space-y-2">
                    <label className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <FileJson className="h-4 w-4" />
                            <span className="text-sm font-medium">metadata.json</span>
                        </div>
                        <Switch
                            checked={includeMetadataJson}
                            onCheckedChange={toggleMetadataJson}
                        />
                    </label>
                    <label className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-4 w-4" />
                            <span className="text-sm font-medium">metadata.csv</span>
                        </div>
                        <Switch
                            checked={includeMetadataCsv}
                            onCheckedChange={toggleMetadataCsv}
                        />
                    </label>
                </div>
                <div className="flex gap-2 rounded-md bg-muted/50 p-2">
                    <span className="text-xs text-muted-foreground">📋</span>
                    <p className="text-xs text-muted-foreground">
                        Metadata files include filenames, alt text, and compression stats.
                    </p>
                </div>
            </div>

            {/* Subscription Status or Upgrade CTA */}
            <div className="mt-auto">
                {isPro ? (
                    <SubscriptionStatus />
                ) : (
                    <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                                <Crown className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <h4 className="text-sm font-bold">Upgrade to Pro</h4>
                                <p className="text-xs text-muted-foreground">
                                    Unlock all premium features
                                </p>
                            </div>
                        </div>

                        {/* Feature highlights */}
                        <div className="mt-3 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Zap className="h-3.5 w-3.5 text-primary" />
                                <span>Unlimited images per day</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span>All features included</span>
                            </div>
                        </div>

                        <Button
                            className="mt-4 w-full"
                            size="sm"
                            onClick={() => setShowUpgradeModal(true)}
                        >
                            View Plans
                        </Button>
                    </div>
                )}
            </div>

            {/* Upgrade Modal */}
            <UpgradeModal
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
            />
        </div>
    );
}
