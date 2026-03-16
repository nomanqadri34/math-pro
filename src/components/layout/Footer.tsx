import Link from "next/link";
import { Infinity as InfinityIcon, Mail, Phone, MapPin, Twitter, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary rounded-xl">
              <InfinityIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Math<span className="text-primary">Pro</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Making mathematics simple, smart, and interactive. Empowering students with 3D learning and AI-powered tutoring.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-semibold mb-6">Platform</h4>
          <ul className="space-y-4 text-sm">
            <li><Link href="/courses" className="hover:text-primary transition-colors">All Courses</Link></li>
            <li><Link href="/resources" className="hover:text-primary transition-colors">Learning Resources</Link></li>
            <li><Link href="/assistant" className="hover:text-primary transition-colors">AI Math Assistant</Link></li>
            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Company</h4>
          <ul className="space-y-4 text-sm">
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Validation</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-6">Get in Touch</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary" />
              <span>support@mathpro.edu</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span>123 Logic Gate, STEM City, NY 10001</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-8 max-w-7xl pt-8 mt-12 border-t border-slate-800 text-xs text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} MathPro Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
