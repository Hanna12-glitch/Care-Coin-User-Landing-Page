import { useWallet } from '@txnlab/use-wallet-react'
import { useNavigate } from 'react-router-dom'

export default function ThankYou() {
  const navigate = useNavigate()
  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto space-y-6 text-center">

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">💛</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-teal-800">Thank you!</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Your care work has been recorded. We will review your entry and
            send Care Coins directly to your wallet within 24 hours.
          </p>
        </div>

        {activeAddress && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Care Coins will be sent to
            </p>
            <p className="text-xs font-mono text-gray-700 break-all">{activeAddress}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left space-y-3">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            What happens next
          </h2>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center mt-0.5">
                1
              </span>
              <span>We review your care work submission (usually within 24 hours).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center mt-0.5">
                2
              </span>
              <span>Care Coins land in your wallet — 1 hour of care = 1 Care Coin.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center mt-0.5">
                3
              </span>
              <span>Choose how to use your coins — see the options in Redeem.</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-all"
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