"use client";

import { ToastContainer } from "react-toastify";

export default function ToastProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {children}
        </>
    );
}
