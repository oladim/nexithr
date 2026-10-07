import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LogosStrip from "@/components/LogosStrip";
import About from "@/components/About";
import Process from "@/components/Process";
import Nvp from "@/components/Nvp";
import Faq from "@/components/Faq";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <LogosStrip />
        <About />
        <Process />
        <Nvp />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
