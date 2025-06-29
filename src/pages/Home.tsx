import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Features from '../components/Features';
import Marketplace from '../components/Marketplace';
import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <div>
      <Hero />
      <Stats />
      <Features />
      <Marketplace />
      <Dashboard />
    </div>
  );
}