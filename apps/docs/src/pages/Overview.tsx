import HeroSection from '../landing/HeroSection';
import StacksSection from '../landing/StacksSection';
import CtaSection from '../landing/CtaSection';

export default function Overview() {
  return (
    <div data-landing>
      <HeroSection />
      <StacksSection />
      <CtaSection />
    </div>
  );
}
