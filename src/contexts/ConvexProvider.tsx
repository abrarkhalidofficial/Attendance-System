import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = (import.meta.env.VITE_CONVEX_URL ?? import.meta.env.REACT_APP_CONVEX_URL) as string;

interface ConvexProviderWrapperProps {
  children: React.ReactNode;
}

export const ConvexProviderWrapper: React.FC<ConvexProviderWrapperProps> = ({
  children,
}) => {
  if (!convexUrl) {
    console.warn("Convex URL is missing. Set VITE_CONVEX_URL/REACT_APP_CONVEX_URL.");
    return (
      <>
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md mb-3">
          Backend is not connected. Set `VITE_CONVEX_URL` to your Convex URL.
        </div>
        {children}
      </>
    );
  }
  const convex = new ConvexReactClient(convexUrl);
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
};
