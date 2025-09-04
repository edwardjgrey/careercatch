export default function UserDashboard({ user }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
      <p>Welcome, {user?.name || 'User'}!</p>
    </div>
  )
}
