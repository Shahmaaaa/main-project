/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
/// <reference types="vite/client" />

interface Window {
  aistudio?: {
    openSelectKey: () => Promise<void>;
    hasSelectedApiKey?: () => Promise<boolean>;
  };
}
