import { Link } from 'react-router-dom'
import { 
  Sparkles, 
  Users, 
  Calendar, 
  Shield, 
  Star, 
  ArrowRight,
  Heart,
  Zap,
  Globe
} from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: Users,
      title: "Certified Therapists",
      description: "Connect with verified and experienced Reiki practitioners worldwide"
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule sessions that fit your schedule with our intuitive booking system"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your personal information and sessions are protected with enterprise-grade security"
    },
    {
      icon: Globe,
      title: "Virtual & In-Person",
      description: "Choose between remote energy healing sessions or meet your therapist in person"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Wellness Enthusiast",
      content: "The Reiki sessions have been transformative for my stress management.",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Business Professional",
      content: "The virtual Reiki sessions have genuinely helped with my anxiety and sleep quality.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Yoga Instructor",
      content: "This platform connects me with other healing modalities. The therapists are professional.",
      rating: 5
    }
  ]

  const stats = [
    { number: "10,000+", label: "Healing Sessions" },
    { number: "500+", label: "Certified Therapists" },
    { number: "50+", label: "Countries Served" },
    { number: "98%", label: "Client Satisfaction" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-16 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                <Sparkles className="w-6 h-6 text-primary-600" />
                <span className="text-primary-600 font-medium">Experience Energy Healing</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
                Find Your Path to
                <span className="block text-gradient bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Inner Peace
                </span>
              </h1>
              
              <p className="text-xl text-neutral-600 mb-8 max-w-2xl">
                Connect with certified Reiki practitioners worldwide. Experience the healing power of 
                energy work through virtual sessions or meet in person for a transformative journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/therapists"
                  className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Find a Therapist
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 border-2 border-primary-600 text-primary-600 font-semibold rounded-full hover:bg-primary-50 transition-all duration-200"
                >
                  Join as Therapist
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-3xl flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-24 h-24 text-primary-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-primary-800 font-medium">Healing Energy Illustration</p>
                  <p className="text-sm text-primary-600 mt-2">Professional imagery coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We've created the most comprehensive platform for Reiki healing, 
              connecting you with the right practitioner for your unique needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-neutral-600">
              Real experiences from people who found healing through our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                  <div className="text-sm text-neutral-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Begin Your Healing Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of people who have discovered the transformative power of Reiki healing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-full hover:bg-primary-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started Today
              <Zap className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/therapists"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-primary-600 transition-all duration-200"
            >
              Browse Therapists
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
