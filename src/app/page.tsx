import HeroSection from "@/components/sections/HeroSection";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CategoriesSection from "@/components/sections/CategoriesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import InstagramGallery from "@/components/sections/InstagramGallery";
import TrustBanner from "@/components/sections/TrustBanner";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBanner />
      <FeaturedProducts />
      <CategoriesSection />
      <TestimonialsSection />
      <InstagramGallery />
    </>
  );
}
