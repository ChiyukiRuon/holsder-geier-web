'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {Button} from "@heroui/react";

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (blob: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number;
    circularCrop?: boolean;
}

export default function ImageCropper({
                                         imageSrc,
                                         onCropComplete,
                                         onCancel,
                                         aspectRatio = 1,
                                         circularCrop = false,
                                     }: ImageCropperProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;

        let cropWidth = width;
        let cropHeight = width / aspectRatio;

        // 如果高度超出，就反过来算
        if (cropHeight > height) {
            cropHeight = height;
            cropWidth = height * aspectRatio;
        }

        setCrop({
            unit: 'px',
            width: cropWidth,
            height: cropHeight,
            x: (width - cropWidth) / 2,
            y: (height - cropHeight) / 2,
        });
    }, [aspectRatio]);

    const handleCropComplete = useCallback(async () => {
        if (!imgRef.current || !crop) {
            return;
        }

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height,
        );

        if (circularCrop) {
            const roundedCanvas = document.createElement('canvas');
            const roundedCtx = roundedCanvas.getContext('2d');
            if (roundedCtx) {
                roundedCanvas.width = canvas.width;
                roundedCanvas.height = canvas.height;
                roundedCtx.beginPath();
                roundedCtx.arc(
                    canvas.width / 2,
                    canvas.height / 2,
                    Math.min(canvas.width, canvas.height) / 2,
                    0,
                    2 * Math.PI,
                );
                roundedCtx.closePath();
                roundedCtx.clip();
                roundedCtx.drawImage(canvas, 0, 0);
                canvas.width = roundedCanvas.width;
                canvas.height = roundedCanvas.height;
            }
        }

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    onCropComplete(blob);
                }
            },
            'image/jpeg',
            0.9,
        );
    }, [crop, onCropComplete, circularCrop]);

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full mx-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">裁剪图片</h2>

                <div className="flex justify-center mb-4 overflow-hidden max-h-[60vh] no-scrollbar">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        aspect={aspectRatio}
                        circularCrop={circularCrop}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop"
                            style={{ maxHeight: '60vh', maxWidth: '100%' }}
                            onLoad={onImageLoad}
                        />
                    </ReactCrop>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        onClick={onCancel}
                        variant={"secondary"}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleCropComplete}
                        variant={"primary"}
                    >
                        裁剪
                    </Button>
                </div>
            </div>
        </div>
    );
}
