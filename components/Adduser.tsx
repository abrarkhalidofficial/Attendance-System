import React from 'react'
import { adduser } from '@/actions'

export default function add() {
    const [userData, setUserData] = React.useState({
        email: '',
        phone: '',
        address: '',
        name: '',
        role: 'User',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setUserData({ ...userData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('email', userData.email)
        formData.append('phone', userData.phone)
        formData.append('address', userData.address)
        formData.append('name', userData.name)
        formData.append('role', userData.role)

        const response = await adduser({ status: null, error: '' }, formData)

        if (response.status === 'ok') {
            alert('User added successfully!')
        } else {
            alert(response.error)
        }
    }

    return (
        <div>
            <h1>Add New User</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                />
                <input
                    type="text"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    required
                />
                <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    required
                />
                <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                />

                {/* Role as a select box */}
                <select
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                    required
                >
                    {
                        ['User', 'Admin'].map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))
                    }
                    {/* Add other roles as needed */}
                </select>

                <button type="submit">Add User</button>
            </form>
        </div>
    )
}


