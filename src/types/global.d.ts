declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      inject: (renderer: any) => void;
    };
  }
}

export {};
