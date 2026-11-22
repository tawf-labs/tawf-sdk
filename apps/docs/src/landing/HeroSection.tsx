import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Github } from 'lucide-react';
import { CONTAINER, DrawnUnderline, HeroStage, IsoGrid, Magnetic } from '../motion';
import PackageStackArt from './art/PackageStackArt';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HeroSection() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 16 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });
  return (
    <section className="relative w-full overflow-hidden bg-[var(--l-glaze)] pb-12">
      <IsoGrid />
      <div className={`${CONTAINER} relative z-10`}>
        <div className="grid min-h-[70svh] items-center gap-8 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="pr-2 text-center md:text-left">
            <motion.p {...rise(0)} className="mb-4 text-sm font-medium text-[var(--l-accent)]">Developer Hub</motion.p>
            <motion.h1
              {...rise(0.1)}
              className="m-0 max-w-[10em] text-[clamp(40px,5.2vw,68px)] leading-[1.04] max-md:mx-auto"
            >
              Build on <DrawnUnderline>Tawf</DrawnUnderline>
            </motion.h1>
            <motion.p {...rise(0.2)} className="mt-5 max-w-[34em] text-[clamp(16px,1.4vw,18.5px)] leading-[1.6] text-[var(--l-muted)] max-md:mx-auto">
              TypeScript SDKs and smart contracts for the Tawf Islamic Foundation ecosystem. Soulbound identity and cryptographic notarization, built as composable @tawf packages on Ethereum.
            </motion.p>
            <motion.div {...rise(0.3)} className="mt-8 flex flex-wrap items-center justify-center gap-3.5 md:justify-start">
              <Magnetic>
                <Link
                  to="/integration"
                  className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-[var(--l-accent)] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[var(--l-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--l-accent)] focus-visible:ring-offset-2"
                >
                  Get started
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <a
                href="https://github.com/tawf-labs/tawf-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-[var(--l-line)] bg-[var(--l-paper)] px-6 text-[15px] font-medium text-[var(--l-ink)] transition-colors hover:border-[var(--l-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--l-accent)] focus-visible:ring-offset-2"
              >
                <Github className="size-4 text-[var(--l-muted)]" />
                View on GitHub
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.2, ease: EASE }}
            className="mx-auto w-full max-w-[620px]"
          >
            <HeroStage>
              <PackageStackArt className="w-full" />
            </HeroStage>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
