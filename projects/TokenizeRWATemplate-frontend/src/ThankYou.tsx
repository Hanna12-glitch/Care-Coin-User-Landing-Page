import { useWallet } from '@txnlab/use-wallet-react'
import { useNavigate } from 'react-router-dom'

export default function ThankYou() {
  const navigate = useNavigate()
  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6 text-center">

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-3xl">🌿</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-teal-800">Thank you</h1>
          <p className="text-gray-600">Your Care Coins are on their way.</p>
        </div>

        <div className="bg-teal-50 rounded-2xl p-4 space-y-1 text-left">
          <p className="text-sm text-teal-800 font-medium">What happens next?</p>
          <ul className="text-sm text-teal-700 space-y-1 list-disc list-inside">
            <li>We review your onboarding answers</li>
            <li>We manually send you test ALGO and Care Coins</li>
            <li>Once received, you can explore your rewards</li>
          </ul>
        </div>

        {activeAddress && (
          <p className="text-xs text-gray-400 font-mono break-all">
            Receiving wallet: {activeAddress}
          </p>
        )}

        <p className="text-xs text-gray-400 italic">
          This is a research pilot — all tokens are on Algorand Testnet and have no monetary value.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/redeem')}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl transition-all"
          >
            Explore Rewards →
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-all"
          >
            Go to Dashboard
          </button>
        </div>

      </div>
    </div>
  )
}