import React, { useCallback, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Image, FileText, X, Eye, EyeOff, Video } from 'lucide-react';

const MEDIA_TYPES = [
    { value: 'none', label: 'No Media' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Document' },
];

export const MessageNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();
    const [showPreview, setShowPreview] = useState(false);

    const originalData = data.originalData?.data || {};
    const value = originalData.message || data.message || "";
    const mediaType = originalData.media_type || 'none';
    const mediaUrl = originalData.media_url || '';
    const mediaFilename = originalData.media_filename || '';

    const updateNodeData = useCallback((updates) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                const newData = { ...node.data.originalData?.data, ...updates };
                return {
                    ...node,
                    data: {
                        ...node.data,
                        message: newData.message,
                        originalData: {
                            ...node.data.originalData,
                            data: newData
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const handleChange = useCallback((e) => {
        updateNodeData({ message: e.target.value });
    }, [updateNodeData]);

    const handleMediaTypeChange = useCallback((val) => {
        updateNodeData({
            media_type: val,
            media_url: val === 'none' ? '' : mediaUrl,
            media_filename: val === 'none' ? '' : mediaFilename,
        });
        if (val === 'none') setShowPreview(false);
    }, [updateNodeData, mediaUrl, mediaFilename]);

    const handleMediaUrlChange = useCallback((e) => {
        updateNodeData({ media_url: e.target.value });
    }, [updateNodeData]);

    const handleFilenameChange = useCallback((e) => {
        updateNodeData({ media_filename: e.target.value });
    }, [updateNodeData]);

    const handleClearMedia = useCallback(() => {
        updateNodeData({ media_type: 'none', media_url: '', media_filename: '' });
        setShowPreview(false);
    }, [updateNodeData]);

    const isValidImageUrl = (url) => {
        if (!url) return false;
        return url.match(/^https?:\/\/.+/i);
    };

    return (
        <div className="flex flex-col gap-2.5 mt-2">
            {/* Message Body */}
            <div className="flex flex-col gap-1">
                <Label htmlFor={`msg-${id}`} className="text-xs text-muted-foreground">Message Body</Label>
                <Textarea
                    id={`msg-${id}`}
                    value={value}
                    onChange={handleChange}
                    className="nodrag text-xs min-h-[60px]"
                    placeholder="Type your message..."
                />
            </div>

            {/* Media Type Selector */}
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Attach Media</Label>
                <Select value={mediaType} onValueChange={handleMediaTypeChange}>
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                        {MEDIA_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value} className="text-xs">
                                <div className="flex items-center gap-2">
                                    {type.value === 'image' && <Image className="h-3 w-3" />}
                                    {type.value === 'video' && <Video className="h-3 w-3" />}
                                    {type.value === 'document' && <FileText className="h-3 w-3" />}
                                    {type.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Image Fields */}
            {mediaType === 'image' && (
                <div className="flex flex-col gap-2 p-2.5 border rounded-md bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Image className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-[11px] font-medium">Image</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {mediaUrl && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setShowPreview(!showPreview)}
                                    title={showPreview ? "Hide preview" : "Show preview"}
                                >
                                    {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                onClick={handleClearMedia}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <Input
                        value={mediaUrl}
                        onChange={handleMediaUrlChange}
                        className="nodrag text-xs h-7"
                        placeholder="https://example.com/image.jpg"
                    />
                    {/* Image Preview */}
                    {showPreview && mediaUrl && isValidImageUrl(mediaUrl) && (
                        <div className="rounded-md overflow-hidden border bg-background">
                            <img
                                src={mediaUrl}
                                alt="Preview"
                                className="w-full max-h-[120px] object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}
                    {showPreview && mediaUrl && !isValidImageUrl(mediaUrl) && (
                        <div className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                            Enter a valid URL to see preview
                        </div>
                    )}
                </div>
            )}

            {/* Document Fields */}
            {mediaType === 'document' && (
                <div className="flex flex-col gap-2 p-2.5 border rounded-md bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-orange-500" />
                            <span className="text-[11px] font-medium">Document</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                            onClick={handleClearMedia}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <Input
                        value={mediaUrl}
                        onChange={handleMediaUrlChange}
                        className="nodrag text-xs h-7"
                        placeholder="https://example.com/file.pdf"
                    />
                    <Input
                        value={mediaFilename}
                        onChange={handleFilenameChange}
                        className="nodrag text-xs h-7"
                        placeholder="Filename (e.g. report.pdf)"
                    />
                    {/* Document Preview */}
                    {mediaUrl && isValidImageUrl(mediaUrl) && (
                        <div className="flex items-center gap-2 p-2 rounded-md border bg-background">
                            <FileText className="h-5 w-5 text-orange-500 shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-medium truncate">
                                    {mediaFilename || 'document'}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                    {mediaUrl.length > 35 ? mediaUrl.substring(0, 35) + '...' : mediaUrl}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Video Fields */}
            {mediaType === 'video' && (
                <div className="flex flex-col gap-2 p-2.5 border rounded-md bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-[11px] font-medium">Video</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                            onClick={handleClearMedia}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <Input
                        value={mediaUrl}
                        onChange={handleMediaUrlChange}
                        className="nodrag text-xs h-7"
                        placeholder="https://example.com/video.mp4"
                    />
                    <Input
                        value={mediaFilename}
                        onChange={handleFilenameChange}
                        className="nodrag text-xs h-7"
                        placeholder="Filename (e.g. video.mp4)"
                    />
                    {/* Video Preview */}
                    {mediaUrl && isValidImageUrl(mediaUrl) && (
                        <div className="flex items-center gap-2 p-2 rounded-md border bg-background">
                            <Video className="h-5 w-5 text-green-500 shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-medium truncate">
                                    {mediaFilename || 'video'}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                    {mediaUrl.length > 35 ? mediaUrl.substring(0, 35) + '...' : mediaUrl}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

