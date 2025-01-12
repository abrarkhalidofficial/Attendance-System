import { useState, useEffect } from 'react';
import { changePassword, checkUser, updatePassword } from '@/actions';
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

        // Validate the form fields
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
            router.push('/profile'); // Redirect to profile or other page
        } else {
            setStatus({ status: 'error', error: result.error });
        }
    };

    return (
        <div className="container">
            <h1>Change Password</h1>
            {status.status === 'success' && <p className="success">Password updated successfully!</p>}
            {status.status === 'error' && <p className="error">{status.error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Change Password</button>
            </form>
        </div>
    );
};

export default ChangePassword;
