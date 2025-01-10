import { useState } from 'react';

export default function CreateUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/users/create', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (res.ok) {
      alert('User created successfully');
      setName('');
      setEmail('');
    } else {
      alert('Error: ' + data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Create User</button>
    </form>
  );
}
