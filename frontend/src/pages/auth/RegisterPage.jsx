import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'farmer', barangay:'', municipality:'' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌾</div>
          <h1 className="text-2xl font-bold text-green-800">Create Account</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['name','Full Name','text','Juan dela Cruz'],['email','Email','email','you@example.com'],['password','Password','password','Min. 6 characters'],['barangay','Barangay','text','e.g. Brgy. San Isidro'],['municipality','Municipality','text','e.g. Tagum City']].map(([key,label,type,ph]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} required={['name','email','password'].includes(key)}
                value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={ph} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <select value={form.role} onChange={e => setForm({...form,role:e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="farmer">🌾 Farmer</option>
              <option value="buyer">🛒 Buyer / Consumer</option>
              <option value="lgu_officer">🏛️ LGU Agricultural Officer</option>
              <option value="expert">🌱 Agricultural Expert</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-green-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
