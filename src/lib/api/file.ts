import {apiClient} from '@/lib/axios';
import type {UploadResponse} from '@/types';
import imageCompression from 'browser-image-compression';

/**
 * 压缩图片
 * @param file 原始文件
 * @param options 压缩选项
 * @returns 压缩后的文件
 */
async function compressImage(
    file: File,
    options?: {
        maxSizeMB?: number;
        maxWidthOrHeight?: number;
        useWebWorker?: boolean;
    }
): Promise<File> {
    const defaultOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 256,
        useWebWorker: true,
        ...options,
    };

    try {
        return await imageCompression(file, defaultOptions);
    } catch (error) {
        console.error('图片压缩失败:', error);
        throw error;
    }
}

/**
 * 比较两个文件的体积
 */
function getFileSizeInBytes(file: File): number {
    return file.size;
}

/**
 * 上传图片文件（自动选择原图或压缩图）
 * @param file 要上传的文件
 * @param usage 上传用途
 * @param compressOptions 压缩选项，如果为 false 则不压缩
 * @returns 上传响应
 */
export async function uploadImage(
    file: File,
    usage: "avatar" | "background",
    compressOptions?: false | {
        maxSizeMB?: number;
        maxWidthOrHeight?: number;
    }
): Promise<UploadResponse> {
    const filesToCompare: File[] = [file];

    // 如果启用了压缩，则生成压缩版本
    if (compressOptions !== false) {
        try {
            const compressedFile = await compressImage(file, compressOptions);
            filesToCompare.push(compressedFile);
        } catch (error) {
            console.warn('压缩失败，将使用原图上传:', error);
        }
    }

    // 选择体积最小的文件
    let selectedFile = filesToCompare[0];
    let minSize = getFileSizeInBytes(selectedFile);

    for (let i = 1; i < filesToCompare.length; i++) {
        const size = getFileSizeInBytes(filesToCompare[i]);
        if (size < minSize) {
            minSize = size;
            selectedFile = filesToCompare[i];
        }
    }

    const isCompressed = selectedFile !== file;
    console.log(`上传${isCompressed ? '压缩后' : '原图'}的图片，大小: ${(minSize / 1024).toFixed(2)} KB`);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('usage', usage);

    const response = await apiClient.post<UploadResponse>('/file/images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}
