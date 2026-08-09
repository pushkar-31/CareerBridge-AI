import Navbar from "@/components/navbar";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="relative overflow-hidden">
        {/* Background Glow */}

        <div className="absolute left-0 top-20 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        <Hero />

        <FeatureCards />

        <Footer />
      </main>
    </>
  );
}