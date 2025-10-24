/// <reference types="vite/client" />

// Augment env types for safer access in ConvexProvider
interface ImportMetaEnv {
  readonly VITE_CONVEX_URL?: string;
  readonly REACT_APP_CONVEX_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}