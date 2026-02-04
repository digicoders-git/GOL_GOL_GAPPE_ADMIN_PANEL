import { useState } from 'react'
import { toast } from 'react-toastify'
import logo from '../assets/logo.jpeg'

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: 'admin@golgolgappe.com', password: 'admin123' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success(`Welcome back, ${data.user.email}!`)
        setIsAuthenticated(true)
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch (error) {
      toast.error('Connection error. Please check if backend is running.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md p-8 border border-orange-100">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden shadow-xl ring-4 ring-orange-200">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Gol Gol Gappe
          </h1>
          <p className="text-gray-600 font-medium">Admin Panel Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-orange-300"
              required
            />
          </div>

          <div className="relative group">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-orange-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Signing in...
              </div>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Default credentials: admin@golgolgappe.com / admin123</p>
        </div>
      </div>
    </div>
  )
}

export default Login