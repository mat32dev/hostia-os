import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Industries from '@/components/Industries';
import Process from '@/components/Process';
import Results from '@/components/Results';
import Pricing from '@/components/Pricing';
import Products from '@/components/Products';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Industries />
        <Process />
        <Results />
        <Pricing />
        <Products />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
