import React, { useState } from "react";
import jsQR from "jsqr";  // Import jsQR library
import { handleLogin, handleLogout } from "@/actions";

const UserAttendancePage = () => {
    const [message, setMessage] = useState("");
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result && typeof reader.result === "string") {
                    const image = new Image();
                    image.src = reader.result;
                    image.onload = () => {
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                            canvas.width = image.width;
                            canvas.height = image.height;
                            ctx.drawImage(image, 0, 0, image.width, image.height);

                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

                            if (qrCode) {
                                setScannedId(qrCode.data);
                                handleScan(qrCode.data);
                            } else {
                                setMessage("No QR code found in the image.");
                            }
                        }
                    };
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleScan = async (data: string | null) => {
        if (data) {
            setScannedId(data);

            const formData = new FormData();
            formData.append("id", data);

            const result = await handleLogin(formData);
            setMessage(result.message || result.error || "An unknown error occurred");
        }
    };

    const logout = async () => {
        const formData = new FormData();
        if (scannedId) {
            formData.append("id", scannedId);
        }

        const result = await handleLogout(formData);
        setMessage(result.message || result.error || "An unknown error occurred");
    };

    return (
        <div
            style={{
                fontFamily: 'Arial, sans-serif',
                padding: '20px',
                backgroundColor: '#f4f4f4',
                height: '100vh',
                overflow: 'auto',
                textAlign: 'center',
            }}
        >
            <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '20px' }}>
                User Attendance (QR Code Upload)
            </h1>

            <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{
                    padding: '10px',
                    marginBottom: '20px',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                }}
            />

            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="QR Code Preview"
                    style={{
                        width: '200px',
                        height: 'auto',
                        margin: '20px 0',
                        borderRadius: '5px',
                    }}
                />
            )}

            <button
                onClick={logout}
                disabled={!scannedId}
                style={{
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    opacity: !scannedId ? 0.5 : 1,
                }}
            >
                Logout
            </button>

            <p
                style={{
                    color: '#ff5733',
                    fontWeight: 'bold',
                    marginTop: '20px',
                }}
            >
                {message}
            </p>
        </div>
    );
};

export default UserAttendancePage;
