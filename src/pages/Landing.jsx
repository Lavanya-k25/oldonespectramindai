import Navbar from "../components/layout/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import WhySpectraMind from "../components/landing/WhySpectraMind";
import DashboardPreview from "../components/landing/DashboardPreview";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <div
      id="top"
      className="min-h-screen bg-white dark:bg-slate-900"
    >

      <Navbar />

      <Hero />

      <Features />

      <WhySpectraMind />

      <DashboardPreview />

      <Footer />

    </div>
  );
}