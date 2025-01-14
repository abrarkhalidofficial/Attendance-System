import { useState, useEffect } from 'react';
import { changePassword, updatePassword } from '@/actions';
import { useRouter } from 'next/navigation';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [status, setStatus] = useState<{ status: string | null; error: string }>({
        status: null,
        error: '',
    });
    const [user, setUser] = useState<{ loggedIn: boolean; role: string | null; id: string | null }>({
        loggedIn: false,
        role: null,
        id: null,
    });

    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const userInfo = await checkUser();
            if (userInfo.loggedIn) {
                setUser({
                    ...userInfo,
                    id: userInfo.id || null,
                });
            }
        };
        getUser();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ status: null, error: '' });

        const { currentPassword, newPassword, confirmPassword } = formData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setStatus({ status: 'error', error: 'All fields are required' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ status: 'error', error: 'Passwords do not match' });
            return;
        }

        if (!user.id) {
            setStatus({ status: 'error', error: 'User ID is not available' });
            return;
        }

        const prevState = { status: null, error: '' };

        const result = await updatePassword(prevState, new FormData());

        if (result.status === 'ok') {
            setStatus({ status: 'success', error: '' });
            router.push('/profile');
        } else {
            setStatus({ status: 'error', error: result.error });
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ textAlign: "center", color: "#333" }}>Change Password</h1>
            {status.status === "success" && (
                <p style={{ color: "green", textAlign: "center", marginBottom: "20px" }}>
                    Password updated successfully!
                </p>
            )}
            {status.status === "error" && (
                <p style={{ color: "red", textAlign: "center", marginBottom: "20px" }}>
                    {status.error}
                </p>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label
                        htmlFor="currentPassword"
                        style={{ marginBottom: "5px", fontWeight: "bold", color: "#555" }}
                    >
                        Current Password
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        required
                        style={{
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            fontSize: "14px",
                        }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label
                        htmlFor="newPassword"
                        style={{ marginBottom: "5px", fontWeight: "bold", color: "#555" }}
                    >
                        New Password
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                        style={{
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            fontSize: "14px",
                        }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label
                        htmlFor="confirmPassword"
                        style={{ marginBottom: "5px", fontWeight: "bold", color: "#555" }}
                    >
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        style={{
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            fontSize: "14px",
                        }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        padding: "10px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "16px",
                        cursor: "pointer",
                        textAlign: "center",
                    }}
                >
                    Change Password
                </button>
            </form>
        </div>

    );
};

export default ChangePassword;
const checkUser = async () => {
    // Simulate an API call to get user information
    return new Promise<{ loggedIn: boolean; role: string | null; id: string | null }>((resolve) => {
        setTimeout(() => {
            resolve({
                loggedIn: true,
                role: 'user',
                id: '12345',
            });
        }, 1000);
    });
};

