import useAuthStore from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-800">Farmer Dashboard</h1>
        <button onClick={() => { logout(); navigate('/login') }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
      </div>
      <p className="text-gray-600">Welcome, {user?.name}! Build your features here using the vibe coding prompts.</p>
    </div>
  )
}
