"use client";
import { useState } from 'react';
import AllUsers from '../components/AllUsers';
import styles from './Dashboard.module.css'; 

export default function Dashboard() {
  const [content, setContent] = useState<keyof typeof contentMap>('dashboard');

  // Content data for each section
  const contentMap = {
    dashboard: (
      <div>
        <AllUsers />
      </div>
    ),
    user: (
      <div>
        <h1>User Management</h1>
        <img
          src="https://via.placeholder.com/600x300"
          alt="User Management"
          className={styles.img}
        />
        <p>Manage users effectively by adding, editing, or removing users from your system.</p>
        <button className={styles.sidebarBtn}>Add New User</button>
      </div>
    ),
    viewattendance: (
      <div>
        <h1>View Attendance</h1>
        <img
          src="https://via.placeholder.com/600x300"
          alt="Attendance"
          className={styles.img}
        />
        <p>Keep track of attendance records for your employees or students.</p>
        <button className={styles.sidebarBtn}>View Records</button>
      </div>
    ),
    leaves: (
      <div>
        <h1>Manage Leaves</h1>
        <img
          src="https://via.placeholder.com/600x300"
          alt="Leaves Management"
          className={styles.img}
        />
        <p>Approve or deny leave requests and manage leave policies.</p>
        <button className={styles.sidebarBtn}>Review Leave Requests</button>
      </div>
    ),
    changepassword: (
      <div>
        <h1>Change Password</h1>
        <img
          src="https://via.placeholder.com/600x300"
          alt="Change Password"
          className={styles.img}
        />
        <p>Securely update your password to keep your account safe.</p>
        <button className={styles.sidebarBtn}>Change Password</button>
      </div>
    ),
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <h2>Sidebar</h2>
        <nav>
          <button onClick={() => setContent('dashboard')} className={styles.sidebarBtn}>
            Dashboard
          </button>
          <button onClick={() => setContent('user')} className={styles.sidebarBtn}>
            User
          </button>
          <button onClick={() => setContent('viewattendance')} className={styles.sidebarBtn}>
            View Attendance
          </button>
          <button onClick={() => setContent('leaves')} className={styles.sidebarBtn}>
            Leaves
          </button>
          <button onClick={() => setContent('changepassword')} className={styles.sidebarBtn}>
            Change Password
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {contentMap[content]}
      </main>
    </div>
  );
}
