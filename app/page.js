import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import MenuGrid from '../components/MenuGrid';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import ProfileDrawer from '../components/ProfileDrawer';
import LoginModal from '../components/LoginModal';

export default function Page() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <MenuGrid />
      <Footer />
      <CartDrawer />
      <ProfileDrawer />
    </>
  );
}
