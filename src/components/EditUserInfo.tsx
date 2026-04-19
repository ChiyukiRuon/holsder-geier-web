import ShowUserInfo from "@/components/ShowUserInfo";
import {HandCard} from "@/components/HandCard";
import KOOK from "@/components/icons/KOOK";
import Google from "@/components/icons/Google";
import React, {useState, useRef, useEffect} from "react";
import { UserInfo } from "@/types";
import {useGoogleLogin} from "@react-oauth/google";
import {generateUserColor, getGoogleProfile} from "@/utils/user";
import {
    Button,
    ColorArea,
    ColorField,
    ColorPicker,
    ColorSlider,
    ColorSwatch,
    Label,
    parseColor,
    toast
} from "@heroui/react";
import ImageCropper from "@/components/ImageCropper";
import {uploadImage} from "@/lib/api/file";
import {getObjectURL} from "@/utils/upload";

interface EditUserInfoProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (data: { userId: string; nickname: string; avatar: string; color: string; background: string }) => void;
    initialData: UserInfo;
}

type ImageFlowState = {
    step: 'idle' | 'cropping' | 'uploading';
    type: 'avatar' | 'background' | null;
    src?: string;
};

export const EditUserInfo = ({ isOpen, onClose, onSave, initialData }: EditUserInfoProps) => {
    const userId = initialData?.userId || "";
    const [tempNickname, setTempNickname] = useState("");
    const [tempAvatar, setTempAvatar] = useState("");
    const [tempColor, setTempColor] = useState("");
    const [tempBackground, setTempBackground] = useState("");

    const tempUserInfo: UserInfo = {
        userId,
        nickname: tempNickname,
        avatar: tempAvatar,
        color: tempColor,
        background: tempBackground,
    };
    const [imageFlow, setImageFlow] = useState<ImageFlowState>({
        step: 'idle',
        type: null,
    });
    const [isUploading, setIsUploading] = useState(false);

    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const backgroundFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setTempNickname(initialData.nickname || "");
            setTempAvatar(initialData.avatar || "");
            setTempColor(initialData.color || "");
            setTempBackground(initialData.background || "");
        }
    }, [isOpen, initialData]);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const profile = await getGoogleProfile(tokenResponse.access_token);
                console.log("用户信息:", profile);

                setTempNickname(profile.name);
                setTempAvatar(profile.avatar)
            } catch (error) {
                console.error("获取用户信息失败:", error);
            }
        },
        onError: () => console.log('Login Failed'),
    });

    const handleKookLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_KOOK_CLIENT_ID ||  "kook_client_id";
        const redirectUri = process.env.NEXT_PUBLIC_KOOK_REDIRECT_URI || "kook_redirect_uri";
        const scope = "get_user_info";

        const authUrl = `https://www.kookapp.cn/app/oauth2/authorize?id=24532&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

        // 打开弹出窗口
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            authUrl,
            "kook_oauth",
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (!popup) {
            toast.warning("请允许弹出窗口以进行 KOOK Oauth");
            return;
        }

        // 监听来自 KOOK Oauth 页面的消息
        const handleMessage = (event: MessageEvent) => {
            // 验证消息来源（生产环境中应该验证origin）
            if (event.data?.type === "KOOK_LOGIN_SUCCESS") {
                toast.success("获取 KOOK 信息成功");
                const { nickname, avatar } = event.data.data;

                setTempNickname(nickname);
                setTempAvatar(avatar);

                // 清理
                popup.close();
                window.removeEventListener("message", handleMessage);
            } else if (event.data?.type === "KOOK_LOGIN_ERROR") {
                console.error("获取 KOOK 信息失败:", event.data.error);
                toast.danger(`获取 KOOK 信息失败: ${event.data.error}`, { timeout: 5000 })

                popup.close();
                window.removeEventListener("message", handleMessage);
            }
        };

        window.addEventListener("message", handleMessage);

    // 轮询检查窗口是否关闭（清理监听器）
    const checkInterval = setInterval(() => {
        if (popup.closed) {
            clearInterval(checkInterval);
            window.removeEventListener("message", handleMessage);
        }
    }, 500);
    };

    // 选择文件
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageFlow({
                step: 'cropping',
                type,
                src: reader.result as string,
            });
        };

        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // 裁剪完成并直接上传
    const handleCropComplete = async (blob: Blob) => {
        if (!imageFlow.type) return;

        setIsUploading(true);
        setImageFlow({ step: 'uploading', type: imageFlow.type, src: URL.createObjectURL(blob) });

        try {
            const res = await uploadCroppedImage(blob, imageFlow.type);

            if (imageFlow.type === 'avatar') {
                setTempAvatar(getObjectURL(res.key));
            } else {
                setTempBackground(getObjectURL(res.key));
            }

            setImageFlow({ step: 'idle', type: null });
        } catch (err) {
            console.error(err);
            toast.danger(`上传失败: ${err}`, { timeout: 5000 })
            setImageFlow({ step: 'idle', type: null });
        } finally {
            setIsUploading(false);
        }
    };

    // 上传
    const uploadCroppedImage = async (blob: Blob, type: 'avatar' | 'background') => {
        const file = new File([blob], `image-${Date.now()}.jpg`, {
            type: 'image/jpeg',
        });

        return uploadImage(file, type, {
            maxSizeMB: 1,
            maxWidthOrHeight: 800,
        });
    };

    if (!isOpen) return null;

    const handleSave = () => {
        onSave?.({
            userId: userId,
            nickname: tempNickname,
            avatar: tempAvatar,
            color: tempColor,
            background: tempBackground
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white border-[3px] border-slate-800 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.1)] w-full max-w-2xl overflow-hidden flex flex-col relative">

                <div className="bg-slate-800 px-6 py-3 flex justify-between items-center">
                    <span className="text-white font-black text-xs uppercase tracking-[0.2em]">编辑玩家信息</span>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">✕</button>
                </div>

                <div className="flex flex-row h-120">
                    <div className="w-1/3 bg-slate-50 border-r-[3px] border-slate-100 p-6 flex flex-col items-center justify-center gap-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">预览</span>

                        <div className="scale-125">
                            <ShowUserInfo
                                type={"md"}
                                user={tempUserInfo}
                            />
                        </div>

                        <div className="scale-75 origin-center flex gap-1.5">
                            <HandCard user={tempUserInfo} cardFace={"front"} value={1} />
                            <HandCard user={tempUserInfo} cardFace={"back"} showBadge={true} />
                        </div>
                    </div>

                    <div className="w-2/3 p-8 overflow-y-auto space-y-6">

                        <section className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">玩家名</label>
                            <div className="flex items-center gap-2">
                                <input
                                    className="flex-1 h-10 px-4 rounded-xl bg-slate-100 text-slate-900 font-bold text-sm border-[3px] border-slate-100 outline-none transition-all focus:border-slate-300 focus:bg-white placeholder:text-slate-400"
                                    value={tempNickname}
                                    onChange={(e) => setTempNickname(e.target.value)}
                                    placeholder="Enter nickname..."
                                />
                                <button
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-all border-[3px] border-transparent hover:border-slate-300"
                                    onClick={handleKookLogin}
                                >
                                    <KOOK size={20} />
                                </button>
                                <button
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-all border-[3px] border-transparent hover:border-slate-300"
                                    onClick={() => handleGoogleLogin()}
                                >
                                    <Google size={20} />
                                </button>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">头像</label>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 h-10 px-4 rounded-xl bg-slate-100 text-xs font-bold border-[3px] border-slate-100 outline-none focus:border-slate-300"
                                    placeholder="Image URL..."
                                    value={tempAvatar}
                                    onChange={(e) => setTempAvatar(e.target.value)}
                                />
                                <button
                                    className="h-10 px-4 rounded-xl bg-slate-200 text-slate-700 font-black text-[10px] uppercase border-[3px] border-slate-200 hover:bg-slate-300 active:scale-95 transition-all"
                                    onClick={() => avatarFileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? '上传中...' : '上传'}
                                </button>
                                <input
                                    type="file"
                                    ref={avatarFileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(e, 'avatar')}
                                />
                            </div>
                        </section>

                        <section className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">主题色</label>
                            <ColorPicker
                                value={parseColor(tempColor || "#6366f1")}
                                onChange={(color) => setTempColor(color.toString("hex"))}
                                className="w-full"
                            >
                                <ColorPicker.Trigger className="w-full h-10 px-2 bg-slate-100 rounded-xl border-[3px] border-slate-100 hover:border-slate-300 transition-all">
                                    <ColorSwatch size="sm" />
                                    <Label className=" flex-1 font-mono font-bold text-sm uppercase text-slate-600" style={{ textAlign: "left" }}>
                                        {tempColor || generateUserColor()}
                                    </Label>
                                </ColorPicker.Trigger>
                                <ColorPicker.Popover className="p-4 gap-3">
                                    <ColorArea
                                        aria-label="颜色区域"
                                        className=""
                                        colorSpace="hsb"
                                        xChannel="saturation"
                                        yChannel="brightness"
                                    >
                                        <ColorArea.Thumb />
                                    </ColorArea>
                                    <ColorSlider
                                        aria-label="色相滑块"
                                        channel="hue"
                                        className="gap-1 px-1"
                                        colorSpace="hsb"
                                    >
                                        <ColorSlider.Track>
                                            <ColorSlider.Thumb />
                                        </ColorSlider.Track>
                                    </ColorSlider>
                                    <ColorField aria-label="颜色值输入">
                                        <ColorField.Group variant="secondary">
                                            <ColorField.Prefix>
                                                <ColorSwatch size="xs" />
                                            </ColorField.Prefix>
                                            <ColorField.Input
                                                className="font-mono text-xs font-bold"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const input = e.currentTarget;
                                                        const value = input.value.trim();

                                                        if (value && /^#[0-9A-Fa-f]{6}$/.test(value)) {
                                                            setTempColor(value);
                                                            input.blur();
                                                        } else if (value && /^[0-9A-Fa-f]{6}$/.test(value)) {
                                                            setTempColor(`#${value}`);
                                                            input.blur();
                                                        }
                                                    }
                                                }}
                                            />
                                        </ColorField.Group>
                                    </ColorField>
                                </ColorPicker.Popover>
                            </ColorPicker>
                        </section>

                        <section className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">卡牌背景</label>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 h-10 px-4 rounded-xl bg-slate-100 text-xs font-bold border-[3px] border-slate-100 outline-none focus:border-slate-300"
                                    placeholder="Background URL..."
                                    value={tempBackground}
                                    onChange={(e) => setTempBackground(e.target.value)}
                                />
                                <button
                                    className="h-10 px-4 rounded-xl bg-slate-200 text-slate-700 font-black text-[10px] uppercase border-[3px] border-slate-200 hover:bg-slate-300 active:scale-95 transition-all"
                                    onClick={() => backgroundFileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? '上传中...' : '上传'}
                                </button>
                                <input
                                    type="file"
                                    ref={backgroundFileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(e, 'background')}
                                />
                            </div>
                        </section>
                    </div>
                </div>

                <div className="p-4 border-t-[3px] border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                    {/* 上传中的提示 */}
                    {imageFlow.step === 'uploading' && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95">
                            <div className="text-slate-600 font-bold">上传中...</div>
                        </div>
                    )}

                    <Button onClick={onClose} variant={"secondary"}>
                        取消
                    </Button>
                    <Button onClick={handleSave} variant={"primary"}>
                        保存
                    </Button>
                </div>
            </div>

            {/* Cropper */}
            {imageFlow.step === 'cropping' && imageFlow.type && (
                <ImageCropper
                    imageSrc={imageFlow.src!}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setImageFlow({ step: 'idle', type: null })}
                    aspectRatio={imageFlow.type === 'avatar' ? 1 : 0.7}
                />
            )}
        </div>
    );
};
