import { getAllUsers, deleteUser, updateUser } from '@/actions';
import React, { useState, useEffect } from 'react';

export default function UserList() {
    interface User {
        id: string;
        name: string;
        email: string;
        password: string;
        role: 'admin' | 'user' | 'guest';
        createdAt: Date;
        updatedAt: Date;
        registrationToken: string | null;
        registrationTokenExpires: Date | null;
    }

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getAllUsers();
            setUsers(users.map(user => ({
                ...user,
                role: user.role.toLowerCase() as 'admin' | 'user' | 'guest'
            })));
        };

        fetchUsers();
    }, []);

    const handleDelete = async (userId: string) => {
        const formData = new FormData();
        formData.append('id', userId);
        const prevState = { status: null, error: '' };
        const deletedUser = await deleteUser(prevState, formData);
        if (deletedUser) {
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    const handleUpdate = async (userId: string) => {
        // Example update data (you may want to prompt for user input)
        const updatedData = new FormData();
        updatedData.append('id', userId);
        updatedData.append('email', 'updatedemail@example.com'); // Modify as needed

        const prevState = { status: null, error: '' };
        const result = await updateUser(prevState, updatedData);

        if (result.status === 'ok') {
            const updatedUser = { ...users.find(user => user.id === userId), email: 'updatedemail@example.com' } as User;
            setUsers(users.map(user => (user.id === userId ? updatedUser : user)));
        } else {
            console.error(result.error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '100%', margin: '2em 0em', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>All User List</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', fontSize: '18px', fontWeight: 'bold', color: '#333', borderBottom: '2px solid #ccc' }}>
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
            </div>

            <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
                {users.map((user) => (
                    <li key={user.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px 20px',
                        borderBottom: '1px solid #e0e0e0',
                        fontSize: '16px',
                        color: '#333',
                        backgroundColor: '#fff',
                        transition: 'background-color 0.3s ease',
                    }}>
                        <div style={{ flex: 1, fontWeight: '600' }}>{user.name}</div>
                        <div style={{ flex: 1, color: '#555' }}>{user.email}</div>
                        <div style={{
                            flex: 1,
                            textTransform: 'capitalize',
                            color: user.role === 'admin' ? '#ff6347' : user.role === 'user' ? '#4caf50' : '#2196f3',
                            fontWeight: '500',
                        }}>
                            {user.role}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => handleDelete(user.id)}
                                style={{
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'background-color 0.3s ease',
                                }}
                            >
                                Delete User
                            </button>
                            <button
                                onClick={() => handleUpdate(user.id)}
                                style={{
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'background-color 0.3s ease',
                                }}
                            >
                                Update User
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

        </div>
    );
}
