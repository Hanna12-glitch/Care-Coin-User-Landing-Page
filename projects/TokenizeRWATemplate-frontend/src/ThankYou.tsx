import { useWallet } from '@txnlab/use-wallet-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ThankYou() {
  const navigate = useNavigate()
  const { activeAddress } = useWallet()

  // Logout-Redirect
  useEffect(() => {
    if (!activeAddress) navigate('/')
  }, [activeAddress, navigate])

  // Flag setzen: dieser User hat das Formular ausgefüllt
  useEffect(() => {
    if (activeAddress) {
      localStorage.setItem(`care-submitted-${activeAddress}`, 'true')
    }
  }, [activeAddress])

  if (!activeAddress) return null

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto space-y-6 text-center">

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-teal-800">Thank you!</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Your care work has been recorded. We will send Care Coins directly to your wallet within 24 hours and notify you via e-mail.
          </p>
        </div>

       

       

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all"
          >
            View my Dashboard →
          </button>
          <button
            onClick={() => navigate('/redeem')}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium text-sm transition-all"
          >
            See Redeem options
          </button>
        </div>

      </div>
    </div>
  )
}