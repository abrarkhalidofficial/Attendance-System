import React, { useState } from 'react';
import { addUser } from '@/actions'; // Import addUser function from your actions file
import UserList from './UserList';
import usePostAction from '@/hooks/usePostAction';
import { toast } from 'react-toastify';



const UserPage = () => {
  const { data, action, isPending } = usePostAction({
    action: addUser,
    defaultState: { error: "", message: "" },
    onSuccess(data) {
      toast.success(data.message);
    },
    onError(data) {
      toast.error(data.error);
    },
  })
  return (
    <div className="user-page" style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Add User</h1>
      <form action={action} style={{ display: 'flex', gap: '15px', maxWidth: '100%', margin: 'auto' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        <div>
          <label htmlFor="email" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        <div>
          <label htmlFor="phone" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Phone</label>
          <input
            type="text"
            id="phone"
            name="phone"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        <div>
          <label htmlFor="address" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Address</label>
          <input
            type="text"
            id="address"
            name="address"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
        <div>
          <label htmlFor="role" style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Role</label>
          <select
            id="role"
            name="role"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            {/* Add other roles as needed */}
          </select>
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '15px'
          }}
        >
          {isPending ? "Adding User..." : "Add User"}
        </button>
      </form>
      <UserList />
    </div>

  );
};

export default UserPage;
