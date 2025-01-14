import React, { useState } from 'react';
import { addUser } from '@/actions'; // Import addUser function from your actions file
import UserList from './UserList';
import usePostAction from '@/hooks/usePostAction';



const UserPage = () => {
  const { data, action, isPending } = usePostAction({
    action: addUser,
    defaultState: { error: "", message: "" },
    onSuccess(data) {
      alert(data.message);
    },
    onError(data) {
      alert(data.error);
    },
  })
  return (
    <div className="user-page">
      <h1>Add User</h1>
      <form action={action} >
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"

          />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            id="phone"
            name="phone"

          />
        </div>
        <div>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"

          />
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <select

            id="role"
            name="role"

          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            {/* Add other roles as needed */}
          </select>
        </div>
        <button type="submit">{
          isPending ? "Adding User..." : "Add User"
        }</button>
      </form>
      <UserList />
    </div>
  );
};

export default UserPage;
