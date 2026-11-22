import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CONTAINER, Magnetic, RevealText, TurningPattern } from '../motion';

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--l-mint)] py-16 md:py-24">
      <TurningPattern />
      <div className={`${CONTAINER} relative z-10 text-center`}>
        <RevealText text="Ready to integrate?" as="h2" className="mb-6 text-3xl md:text-4xl" />
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--l-muted)]">
          Wire Tawf identity and notarization into your ZISWAF product in five steps.
        </p>
        <div className="flex justify-center">
          <Magnetic>
            <Link
              to="/integration"
              className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-[var(--l-accent)] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[var(--l-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--l-accent)] focus-visible:ring-offset-2"
            >
              Get started <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
