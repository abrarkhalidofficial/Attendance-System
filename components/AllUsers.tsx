import React from 'react'
import { adduser } from '@/actions'
import UserList from './UserList'

export default function Adduser() {
  const [userData, setUserData] = React.useState({
    email: '',
    phone: '',
    address: '',
    name: '',
    role: ''
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
    <div style={{ padding: '20px', maxWidth: '100%', margin: 'auto', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>Add New User</h1>
      <form style={{
        display: 'flex'
      }} onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          name="phone"
          value={userData.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          name="address"
          value={userData.address}
          onChange={handleChange}
          placeholder="Address"
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          name="name"
          value={userData.name}
          onChange={handleChange}
          placeholder="Name"
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <select
          name="role"
          value={userData.role}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {['User', 'Admin'].map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
          {/* Add other roles as needed */}
        </select>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px' }}>
          Add User
        </button>
      </form>
      <UserList />
    </div>

  )
}


