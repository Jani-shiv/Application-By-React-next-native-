import { motion } from 'framer-motion'
import { Mail, CheckCircle } from 'lucide-react'

const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Check your email
        </h1>
        
        <p className="text-lg text-neutral-600 mb-8">
          We've sent a verification link to your email address. Please click the link to verify your account.
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
          <p className="text-sm text-neutral-600">
            Verification email sent successfully
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyEmailPage
