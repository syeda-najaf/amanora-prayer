interface ImportMetaEnv { readonly PROD: boolean; readonly DEV: boolean; readonly MODE: string; readonly VITE_AMANORA_REELS_FEED_URL?: string; readonly VITE_SUPABASE_URL?: string; readonly VITE_SUPABASE_ANON_KEY?: string }
interface ImportMeta { readonly env: ImportMetaEnv }
declare module "*.css";
declare module "qrcode.react" { export const QRCodeSVG: any; }
