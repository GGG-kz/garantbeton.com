import { useState } from 'react'
import { authApi } from '../api/auth'

export default function ApiTestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await authApi.login({
        login: 'admin',
        password: 'admin123'
      })
      setResult(JSON.stringify(response, null, 2))
    } catch (error: any) {
      setResult(`Error: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`)
    }
    setLoading(false)
  }

  const testApiUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL
    setResult(`API URL: ${apiUrl}`)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">API Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testApiUrl}
          className="bg-black text-white px-4 py-2 rounded hover:bg-mono-800"
        >
          Test API URL
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-mono-800 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-black"
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
      </div>
      
      <pre className="mt-4 p-4 bg-mono-100 rounded overflow-auto text-black">
        {result}
      </pre>
    </div>
  )
}