export const getObjectURL = (key: string) => {
    return `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${key}`;
}
