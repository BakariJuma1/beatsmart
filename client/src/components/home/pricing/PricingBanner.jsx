import { motion } from "framer-motion";
import { Check, X, Music, Package, FileAudio, Download } from "lucide-react";

export const PricingBanner = () => {
  const beatLicenses = [
    {
      name: "MP3 Lease",
      price: "$20",
      description: "Basic rights for non-profit use",
      features: [
        "MP3 File (320kbps)",
        "Non-profit streaming",
        "Up to 500,000 streams",
        "Radio play (non-commercial)",
        "Must credit producer"
      ],
      limitations: [
        "No commercial use",
        "No music videos",
        "No distribution"
      ],
      color: "green"
    },
    {
      name: "WAV Lease",
      price: "$50",
      description: "Standard rights for wider distribution",
      features: [
        "WAV File (24-bit)",
        "Profit streaming",
        "Up to 1,000,000 streams",
        "Music videos allowed",
        "Radio play (commercial)",
        "Digital distribution"
      ],
      limitations: [
        "No resale of beat",
        "Exclusive rights not included"
      ],
      color: "blue"
    },
    {
      name: "Trackouts",
      price: "$60",
      description: "Full stems for professional mixing",
      features: [
        "All individual tracks (WAV)",
        "Unlimited streams",
        "All WAV lease rights",
        "Professional mixing capability",
        "Lifetime license"
      ],
      limitations: [
        "Exclusive rights not included"
      ],
      color: "purple"
    },
    {
      name: "Exclusive Rights",
      price: "Negotiable",
      description: "Complete ownership of the beat",
      features: [
        "All trackouts & files",
        "Complete ownership",
        "Beat removed from store",
        "Unlimited everything",
        "Priority support",
        "Custom contract"
      ],
      limitations: [],
      color: "red"
    }
  ];

  const soundPackLicense = {
    price: "$20",
    features: [
      "All samples included (WAV)",
      "Royalty-free",
      "Commercial use allowed",
      "Lifetime access",
      "Unlimited projects",
      "No attribution required"
    ]
  };

  return (
    <section className="py-16 bg-gray-900/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Clear <span className="text-red-500">Pricing</span> & Licensing
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Know exactly what you're getting with our transparent licensing terms
          </p>
        </div>

        {/* Beat Licenses */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Music className="w-6 h-6 text-red-500" />
            <h3 className="text-2xl font-bold text-white">Beat Licenses</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beatLicenses.map((license, index) => (
              <motion.div
                key={license.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-red-500/50 transition-all"
              >
                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-white mb-2">{license.name}</h4>
                  <div className="text-3xl font-bold text-green-400 mb-2">{license.price}</div>
                  <p className="text-gray-400 text-sm">{license.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-4">
                  {license.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {license.limitations.length > 0 && (
                  <div className="pt-4 border-t border-gray-800">
                    {license.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-gray-500">
                        <X className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sound Pack License */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Package className="w-6 h-6 text-blue-500" />
            <h3 className="text-2xl font-bold text-white">Sound Pack License</h3>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-gray-900 rounded-2xl p-8 border border-blue-500/30"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">Standard License</h4>
              <div className="text-4xl font-bold text-blue-400 mb-2">{soundPackLicense.price}</div>
              <p className="text-gray-400">One-time payment, lifetime access</p>
            </div>

            <div className="space-y-3">
              {soundPackLicense.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingBanner;