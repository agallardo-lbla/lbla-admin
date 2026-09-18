/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CORE_API_URL?: string;
  readonly VITE_LBLA_ID_ISSUER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
