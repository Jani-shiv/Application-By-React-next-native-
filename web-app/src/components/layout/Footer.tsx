import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">R</span>
              </div>
              <span className="text-xl font-bold text-white">Reiki Healing</span>
            </div>
            <p className="text-sm text-neutral-400">
              Connecting you with certified Reiki practitioners for your healing journey. 
              Experience the power of energy healing from the comfort of your home or in person.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/therapists" className="text-sm hover:text-primary-400 transition-colors">
                  Find Therapists
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-primary-400 transition-colors">
                  About Reiki
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm hover:text-primary-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm hover:text-primary-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm hover:text-primary-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-primary-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cancellation" className="text-sm hover:text-primary-400 transition-colors">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-400" />
                <span className="text-sm">support@reikihealing.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span className="text-sm">Available Worldwide</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-neutral-800 rounded-lg">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Heart className="w-4 h-4 text-red-400 mr-2" />
                Emergency Support
              </h4>
              <p className="text-xs text-neutral-400">
                For urgent emotional support, please contact your local emergency services 
                or mental health crisis helpline.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-neutral-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-400">
            © {currentYear} Reiki Healing Platform. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-xs text-neutral-500">Made with</span>
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-xs text-neutral-500">for healing and wellness</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
