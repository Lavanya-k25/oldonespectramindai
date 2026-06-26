import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-20">

      <div className="max-w-7xl mx-auto px-8">

        <div className="grid md:grid-cols-4 gap-12">

          {/* Brand */}

          <div>

            <h2 className="text-3xl font-bold">
              SpectraMind
            </h2>

            <p className="text-gray-400 mt-4 leading-relaxed">
              A unified platform for compliance management,
              evidence collection, risk monitoring, vendor
              oversight, and trust reporting.
            </p>

          </div>

          {/* Solutions */}

          <div>

            <h3 className="font-semibold text-lg mb-4">
              Solutions
            </h3>

            <div className="space-y-3 text-gray-400">

              <Link
                to="/solutions/soc2"
                className="block hover:text-white"
              >
                SOC 2 Compliance
              </Link>

              <Link
                to="/solutions/iso27001"
                className="block hover:text-white"
              >
                ISO 27001
              </Link>

              <Link
                to="/solutions/hipaa"
                className="block hover:text-white"
              >
                HIPAA
              </Link>

            </div>

          </div>

          {/* Resources */}

          <div>

            <h3 className="font-semibold text-lg mb-4">
              Resources
            </h3>

            <div className="space-y-3 text-gray-400">

              <Link
                to="/about"
                className="block hover:text-white"
              >
                About
              </Link>

              <Link
                to="/faq"
                className="block hover:text-white"
              >
                FAQs
              </Link>

              <Link
                to="/contact"
                className="block hover:text-white"
              >
                Contact
              </Link>

            </div>

          </div>

          {/* Product */}

          <div>

            <h3 className="font-semibold text-lg mb-4">
              Product
            </h3>

            <div className="space-y-3 text-gray-400">

              <Link
                to="/testimonials"
                className="block hover:text-white"
              >
                View Product
              </Link>

              <Link
                to="/login"
                className="block hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/pricing"
                className="block hover:text-white"
              >
                Pricing
              </Link>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">

          <p className="text-gray-500">
            © 2026 SpectraMind. All rights reserved.
          </p>

          <p className="text-gray-500 mt-4 md:mt-0">
            Built for modern compliance teams.
          </p>

        </div>

      </div>

    </footer>
  );
}
