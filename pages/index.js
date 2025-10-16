import VideoSection from '@/components/VideoSection';
import Navbar from '../components/Navbar'; // Assuming your Navbar is in this path
import Hero from '@/components/Hero';
import ProductAbout from '@/components/ProductAbout';
import OrderForm from '@/components/OrderForm';
import ContactSection from '@/components/ContactSection';

export default function HomePage() {
  return (
    <div>
      <Navbar /> {/* Your existing Navbar component */}
      <Hero />
      <VideoSection />
      <ProductAbout />
      <OrderForm />
      <ContactSection />
    </div>
  );
}
