import { Zap, Shield, TrendingUp } from "lucide-react";

export const FeaturesSection = () => (
  <section className="py-16 bg-gray-900/30">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Why Choose <span className="text-red-500">Beats by Baraju</span>?
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-3">Instant Delivery</h3>
          <p className="text-gray-400">Get your beats immediately after purchase with full stems and contracts</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-3">Clear Licensing</h3>
          <p className="text-gray-400">Professional contracts and clear rights for commercial use</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
          <p className="text-gray-400">Industry-standard production quality ready for radio play</p>
        </div>
      </div>
    </div>
  </section>
);