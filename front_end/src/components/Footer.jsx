import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Column 1: About */}
        <div>
          <h3 className="text-2xl font-bold mb-4">CENTRIC CARE</h3>
          <p className="text-sm leading-relaxed text-purple-100">
            CENTRIC CARE is a secure cloud-based electronic medical record platform
            designed to empower both healthcare providers and patients through
            smart digital tools and seamless experiences.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#home" className="hover:underline hover:text-purple-200">
                Home
              </a>
            </li>
            <li>
              <a
                href="#services"
                className="hover:underline hover:text-purple-200"
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="hover:underline hover:text-purple-200"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="hover:underline hover:text-purple-200"
              >
                Contact
              </a>
            </li>
            <li>
              <Link
                to="/auths/login"
                className="hover:underline hover:text-purple-200"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/auths/register"
                className="hover:underline hover:text-purple-200"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact & Support</h4>
          <ul className="text-sm space-y-2 text-purple-100">
            <li>
              Email:{" "}
              <a href="mailto:support@emedrec.com" className="hover:underline">
                support@emedrec.com
              </a>
            </li>
            <li>
              Phone:{" "}
              <a href="tel:+680630661" className="hover:underline">
                +1 (234) 567-80630661
              </a>
            </li>
            <li>Support Hours: Mon - Fri, 9am - 6pm</li>
            <li>Location: Obobo,Mfou and Direction General at Olembe</li>
          </ul>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="mt-12 border-t border-purple-700 pt-6 text-center text-sm text-purple-200">
        &copy; {new Date().getFullYear()} EMR. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
