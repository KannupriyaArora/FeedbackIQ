import Features from '../components/landing/Features';
import Footer from '../components/landing/Footer';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';

const DEMO_REPORT_HREF = '/report/demo';
const GITHUB_URL = 'https://github.com/KannupriyaArora';

export default function Home() {
  return (
    <div className="bg-[#0f172a] text-white">
      <main className="mx-auto max-w-6xl px-6">
        <Hero demoHref={DEMO_REPORT_HREF} />
        <Features />
        <HowItWorks />
      </main>
      <Footer githubUrl={GITHUB_URL} />
    </div>
  );
}
