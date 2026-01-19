'use client';

import { useState } from 'react';
import { usePipelineStore } from '@/stores/pipeline-store';
import { useLicense } from '@/hooks/use-license';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CitySelector } from '@/components/features/city-selector';
import { UpgradeModal } from '@/components/features/upgrade-modal';
import { PresetCards } from '@/components/features/preset-cards';
import { cn } from '@/lib/utils';
import type { GeoLocation } from '@/lib/geo/types';
import {
    Shrink,
    FileImage,
    Shield,
    MapPin,
    Sparkles,
    ChevronRight,
    Edit2,
    Crop,
    Link,
    Unlink
} from 'lucide-react';

export function SidebarLeft() {
    const steps = usePipelineStore((state) => state.steps);
    const toggleStep = usePipelineStore((state) => state.toggleStep);
    const updateStepSettings = usePipelineStore((state) => state.updateStepSettings);

    const { isPro, canUseAI } = useLicense();

    const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const webpStep = steps.find((s) => s.type === 'convertWebp');
    const geoTagStep = steps.find((s) => s.type === 'geoTag');
    const compressStep = steps.find((s) => s.type === 'compress');
    const cropStep = steps.find((s) => s.type === 'crop');
    const compressionQuality = compressStep?.settings?.quality ?? 80;
    const cropWidth = cropStep?.settings?.cropWidth;
    const cropHeight = cropStep?.settings?.cropHeight;
    const maintainAspectRatio = cropStep?.settings?.maintainAspectRatio ?? true;

    const webpEnabled = webpStep?.enabled;
    const geoTagEnabled = geoTagStep?.enabled;

    // Helper to get icon component
    const getIcon = (type: string) => {
        switch (type) {
            case 'compress': return Shrink;
            case 'convertWebp': return FileImage;
            case 'removeExif': return Shield;
            case 'geoTag': return MapPin;
            case 'altText': return Sparkles;
            case 'crop': return Crop;
            default: return ChevronRight;
        }
    };

    const handleQualityChange = (value: number[]) => {
        if (compressStep) {
            updateStepSettings(compressStep.id, { quality: value[0] });
        }
    };

    const handleCropWidthChange = (value: string) => {
        if (cropStep) {
            const width = value ? parseInt(value, 10) : undefined;
            updateStepSettings(cropStep.id, { cropWidth: width });
        }
    };

    const handleCropHeightChange = (value: string) => {
        if (cropStep) {
            const height = value ? parseInt(value, 10) : undefined;
            updateStepSettings(cropStep.id, { cropHeight: height });
        }
    };

    const handleAspectRatioToggle = () => {
        if (cropStep) {
            updateStepSettings(cropStep.id, { maintainAspectRatio: !maintainAspectRatio });
        }
    };

    // Get quality label based on value
    const getQualityLabel = (quality: number): string => {
        if (quality >= 90) return 'Highest';
        if (quality >= 80) return 'High';
        if (quality >= 60) return 'Medium';
        if (quality >= 40) return 'Low';
        return 'Lowest';
    };

    const handleGeoLocationChange = (location: GeoLocation | null) => {
        const geoTagStep = steps.find((s) => s.type === 'geoTag');
        if (geoTagStep) {
            updateStepSettings(geoTagStep.id, {
                geoLocation: location
                    ? {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        cityName: location.cityName,
                        adminName: location.adminName,
                        countryName: location.countryName,
                    }
                    : undefined, // Fix: Use undefined instead of null to match type
            });
        }
    };

    // Determine expected output format
    const getExpectedOutput = () => {
        if (webpEnabled) {
            return { format: 'WebP', color: 'text-emerald-500' };
        }
        if (geoTagEnabled) {
            return { format: 'JPEG', color: 'text-emerald-500' };
        }
        return { format: 'Original', color: 'text-muted-foreground' };
    };

    const expectedOutput = getExpectedOutput();

    return (
        <div className="flex h-full flex-col">
            {/* Scrollable content area - scrollbar at edge */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-4 p-4 pr-3">
                    {/* Preset Cards */}
                    <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Presets
                        </h3>
                        <PresetCards />
                    </div>

                    {/* Processing Options */}
                    <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Processing Options
                        </h3>
                        <div className="flex flex-col gap-0.5">
                    {steps.map((step) => {
                        const Icon = getIcon(step.type);
                        const isCompress = step.type === 'compress';
                        const isGeoTag = step.type === 'geoTag';
                        const isAltText = step.type === 'altText';
                        const isCrop = step.type === 'crop';

                        // Disable Geo-Tag when WebP is enabled
                        const isGeoTagDisabled = isGeoTag && webpEnabled;
                        // AI Alt Text is now free for all users
                        const isAltTextLocked = false;

                        return (
                            <div key={step.id} className="flex flex-col">
                                <div className={cn(
                                    "flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50",
                                    (isGeoTagDisabled || isAltTextLocked) && "opacity-50"
                                )}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">
                                            {step.label}
                                        </span>
                                        {step.requiresPro && !isPro && (
                                            <span className="rounded bg-black px-1 py-0.5 text-[8px] font-bold text-white dark:bg-white dark:text-black">
                                                PRO
                                            </span>
                                        )}
                                    </div>
                                    <Switch
                                        checked={isGeoTagDisabled ? false : step.enabled}
                                        disabled={isGeoTagDisabled}
                                        onCheckedChange={() => {
                                            // T097: Show UpgradeModal when free user tries AI alt text
                                            if (isAltText && !step.enabled && isAltTextLocked) {
                                                setIsUpgradeModalOpen(true);
                                                return;
                                            }
                                            toggleStep(step.id);
                                            if (isGeoTag && !step.enabled) { // If geoTag is being enabled
                                                setIsGeoModalOpen(true);
                                            }
                                        }}
                                    />
                                </div>

                                {/* Compression Quality Slider */}
                                {isCompress && step.enabled && (
                                    <div className="mx-2 mb-1 mt-0.5 rounded-md bg-muted/30 px-2 py-2">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground">Quality</span>
                                            <span className="text-xs font-medium">
                                                {compressionQuality}% <span className="text-muted-foreground">({getQualityLabel(compressionQuality)})</span>
                                            </span>
                                        </div>
                                        <Slider
                                            value={[compressionQuality]}
                                            onValueChange={handleQualityChange}
                                            min={10}
                                            max={100}
                                            step={5}
                                            className="w-full"
                                        />
                                        <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                                            <span>Smaller</span>
                                            <span>Better</span>
                                        </div>
                                    </div>
                                )}

                                {/* Crop/Resize Settings */}
                                {isCrop && step.enabled && (
                                    <div className="mx-2 mb-1 mt-0.5 rounded-md bg-muted/30 px-2 py-2">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground">Dimensions</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 px-1.5 text-xs"
                                                onClick={handleAspectRatioToggle}
                                                title={maintainAspectRatio ? "Lock aspect ratio" : "Unlock aspect ratio"}
                                            >
                                                {maintainAspectRatio ? (
                                                    <Link className="h-3 w-3" />
                                                ) : (
                                                    <Unlink className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label className="mb-0.5 block text-[10px] text-muted-foreground">Width (px)</label>
                                                <Input
                                                    type="number"
                                                    placeholder="Auto"
                                                    value={cropWidth || ''}
                                                    onChange={(e) => handleCropWidthChange(e.target.value)}
                                                    className="h-7 text-xs"
                                                    min={1}
                                                    max={10000}
                                                />
                                            </div>
                                            <span className="mt-4 text-xs text-muted-foreground">×</span>
                                            <div className="flex-1">
                                                <label className="mb-0.5 block text-[10px] text-muted-foreground">Height (px)</label>
                                                <Input
                                                    type="number"
                                                    placeholder="Auto"
                                                    value={cropHeight || ''}
                                                    onChange={(e) => handleCropHeightChange(e.target.value)}
                                                    className="h-7 text-xs"
                                                    min={1}
                                                    max={10000}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-1.5 text-[10px] text-muted-foreground">
                                            {!cropWidth && !cropHeight ? (
                                                <span>Set width and/or height to resize</span>
                                            ) : maintainAspectRatio ? (
                                                <span>Aspect ratio will be maintained</span>
                                            ) : (
                                                <span>Image will be stretched to fit</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Nested City Display for Geo-Tag step */}
                                {isGeoTag && step.enabled && !isGeoTagDisabled && (
                                    <div className="mx-2 mb-1 mt-0.5 rounded-md bg-muted/30 px-2 py-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 flex-col gap-0.5">
                                                <label className="text-xs font-medium text-muted-foreground">Location</label>
                                                <span className="truncate text-xs font-medium" title={step.settings?.geoLocation?.cityName || "No city selected"}>
                                                    {step.settings?.geoLocation?.cityName || "Select a city..."}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                                                onClick={() => setIsGeoModalOpen(true)}
                                            >
                                                <Edit2 className="h-2.5 w-2.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Geo-Tagging Modal */}
            <Dialog open={isGeoModalOpen} onOpenChange={setIsGeoModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Select Location</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <CitySelector
                            value={steps.find(s => s.type === 'geoTag')?.settings?.geoLocation || null}
                            onChange={(loc) => handleGeoLocationChange(loc)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* T097: Upgrade Modal for Pro features */}
            <UpgradeModal
                open={isUpgradeModalOpen}
                onOpenChange={setIsUpgradeModalOpen}
                feature="ai"
            />

            {/* Output Format - Fixed at bottom */}
            <div className="mx-4 mb-4 mt-2 flex shrink-0 items-center justify-between rounded-md bg-muted/30 px-2 py-1.5">
                <span className="text-xs text-muted-foreground">Output</span>
                <span className={cn("text-sm font-medium", expectedOutput.color)}>
                    {expectedOutput.format}
                </span>
            </div>
        </div>
    );
}
