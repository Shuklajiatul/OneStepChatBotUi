"use client";

import { useState, useEffect, useRef } from "react";
import {
    Copy,
    UploadCloud,
    Loader2,
    Image as ImageIcon,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

function AuthImage({ src, alt, className }) {
    const [imgSrc, setImgSrc] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) return;

        let objectUrl = null;
        const fetchImage = async () => {
            try {
                const res = await fetch(src, {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    },
                });
                if (res.ok) {
                    const blob = await res.blob();
                    objectUrl = URL.createObjectURL(blob);
                    setImgSrc(objectUrl);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Error fetching image", err);
                setError(true);
            }
        };

        fetchImage();
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [src]);

    if (error) {
        return (
            <div className={`flex h-full w-full flex-col items-center justify-center bg-muted/50 text-muted-foreground ${className}`}>
                <ImageIcon className="h-8 w-8 opacity-50 mb-2" />
                <span className="text-xs">Failed to load</span>
            </div>
        );
    }

    if (!imgSrc) {
        return (
            <div className={`flex h-full w-full items-center justify-center bg-muted/50 ${className}`}>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
            </div>
        );
    }

    return <img src={imgSrc} alt={alt} className={className} loading="lazy" />;
}

export default function MediaPage() {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchImages = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/media/`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                const sortedImages = (data.data || []).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                );
                setImages(sortedImages);
            } else {
                toast.error("Failed to load images");
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            toast.error("Error loading images");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/media/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Image uploaded successfully!");
                fetchImages();
            } else {
                toast.error(data.message || "Failed to upload image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const fallbackCopy = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand("copy");
            if (successful) {
                toast.success("URL copied to clipboard");
            } else {
                toast.error("Failed to copy URL");
            }
        } catch (err) {
            console.error("Fallback: Oops, unable to copy", err);
            toast.error("Failed to copy URL");
        }

        document.body.removeChild(textArea);
    };

    const copyToClipboard = (url) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(() => toast.success("URL copied to clipboard"))
                .catch(() => fallbackCopy(url));
        } else {
            fallbackCopy(url);
        }
    };

    return (
        <div className="flex h-full w-full flex-col p-6 overflow-auto">
            <div className="flex items-center justify-between pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Media Gallery</h1>
                    <p className="text-muted-foreground">
                        Manage and upload your images to use in workflows.
                    </p>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="gap-2"
                    >
                        {isUploading
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <UploadCloud className="h-4 w-4" />}
                        {isUploading ? "Uploading..." : "Upload Image"}
                    </Button>
                </div>
            </div>

            {isLoading
                ? <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
                : images.length === 0
                    ? <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h2 className="mt-6 text-xl font-semibold">
                                No images uploaded
                            </h2>
                            <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground">
                                You haven't uploaded any media yet. Upload images to easily
                                copy their URLs and use them in your bot workflows.
                            </p>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="relative"
                            >
                                Upload your first image
                            </Button>
                        </div>
                    </div>
                    : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-in fade-in-50">
                        {images.map((image) => (
                            <div
                                key={image.mediaId}
                                className="group relative flex flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="aspect-square w-full relative bg-muted/50 overflow-hidden">
                                    {image.url
                                        ? <AuthImage
                                            src={image.url}
                                            alt={image.fileName}
                                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                        />
                                        : <div className="flex h-full w-full items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                        </div>}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity flex items-center justify-center gap-2 group-hover:opacity-100 backdrop-blur-[2px]">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-8 gap-1 shadow-lg"
                                            onClick={() => copyToClipboard(image.url)}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                            Copy URL
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 grid place-items-center shadow-lg bg-background/80 hover:bg-destructive hover:text-destructive-foreground border-none"
                                            onClick={() => window.open(image.url, "_blank")}
                                            title="View full size"
                                        >
                                            <ImageIcon className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p
                                        className="truncate text-sm font-medium"
                                        title={image.fileName}
                                    >
                                        {image.fileName}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {(image.fileSize / 1024).toFixed(1)} KB •{" "}
                                        {new Date(image.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>}
        </div>
    );
}
