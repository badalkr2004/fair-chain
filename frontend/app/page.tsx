import Link from 'next/link';
import { Leaf, TrendingUp, Shield, BarChart3, ArrowRight, Search } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF5]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-16 py-4 bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-green-800">FairChain</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-green-700 transition-colors px-4 py-2">Login</Link>
          <Link href="/signup" className="text-sm font-semibold bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-16 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Leaf className="w-4 h-4" /> AI-Powered Agriculture Platform
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Transparent <span className="text-green-600">Agri-Marketplace</span> for Everyone
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Connecting farmers, intermediaries, and consumers through a transparent supply chain with AI-powered demand forecasting and end-to-end traceability.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-200">
              Start Trading <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:border-gray-300 transition-all">
              <Search className="w-5 h-5" /> Track Product
            </Link>
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="px-6 lg:px-16 pb-20">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-4">Choose Your Role</h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Join as a farmer, intermediary, or consumer and start trading transparently.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link href="/signup?role=FARMER" className="group">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-5 group-hover:bg-green-100 transition-colors">
                <Leaf className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Farmer</h3>
              <p className="text-gray-500 text-sm mb-4">List your produce, receive bids from intermediaries, and track your products through the supply chain.</p>
              <span className="text-green-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Register as Farmer <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
          <Link href="/signup?role=INTERMEDIARY" className="group">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-colors">
                <TrendingUp className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Intermediary</h3>
              <p className="text-gray-500 text-sm mb-4">Place bids on products, manage supply chain logistics, and handle storage and processing services.</p>
              <span className="text-amber-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Register as Intermediary <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
          <Link href="/signup?role=CONSUMER" className="group">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Consumer</h3>
              <p className="text-gray-500 text-sm mb-4">Browse products, place orders, and verify the journey of every product from farm to table.</p>
              <span className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Register as Consumer <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-16 py-20 bg-white border-y border-gray-100">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { icon: <TrendingUp className="w-6 h-6" />, title: 'Transparent Pricing', desc: 'See exactly how profits are shared among all stakeholders.' },
            { icon: <BarChart3 className="w-6 h-6" />, title: 'AI Forecasting', desc: 'Get insights on demand, supply trends, and optimal pricing.' },
            { icon: <Search className="w-6 h-6" />, title: 'End-to-End Traceability', desc: 'Track produce from farm to table with hash-verified records.' },
            { icon: <Shield className="w-6 h-6" />, title: 'Secure Transactions', desc: 'Smart contract-style rules for payments and delivery.' },
          ].map((f, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-16 py-8 text-center">
        <p className="text-sm text-gray-400">© 2026 FairChain. AI-Powered Transparent Agri-Marketplace.</p>
      </footer>
    </div>
  );
}
