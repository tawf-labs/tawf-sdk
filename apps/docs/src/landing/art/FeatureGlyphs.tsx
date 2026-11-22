import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Float, IsoBox, FILLS, PAL, drop, fade, pop, VIEW } from '../../motion';
import Coin from './Coin';

/* Two small iso glyphs, 96 x 96, floor centre at (48, 78). */
function Frame({ className, children }: { className: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 96 96"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      focusable="false"
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={VIEW}
    >
      <motion.ellipse variants={fade(0.05, 0.5)} cx="48" cy="80" rx="38" ry="11" fill="rgba(16,38,31,.07)" />
      {children}
    </motion.svg>
  );
}

const HONEY_FILLS: [string, string, string] = ['#E6D294', '#D4BE7C', PAL.butter];

/* Identity: a green stack of three blocks with a seal on top. */
export function IdentityGlyph({ className = '' }: { className?: string }) {
  return (
    <Frame className={className}>
      <IsoBox x={48} y={78} a={40} b={40} h={13} fills={[...FILLS.zakat]} variants={drop(0, 0.1, 0.14, -30)} />
      <IsoBox x={48} y={65} a={34} b={34} h={13} fills={[...FILLS.waqf]} variants={drop(1, 0.1, 0.14, -30)} />
      <Float as="g" amplitude={2.5} duration={6} delay={1}>
        <IsoBox x={48} y={52} a={28} b={28} h={13} fills={[...FILLS.paper]} variants={drop(2, 0.1, 0.14, -30)} />
        <Coin cx={48} cy={30} r={9} color={PAL.accent} face={PAL.mint} variants={pop(0.7)} />
      </Float>
    </Frame>
  );
}

/* Notarization: a honey stack with a stamped seal and a tick. */
export function NotarizationGlyph({ className = '' }: { className?: string }) {
  return (
    <Frame className={className}>
      <IsoBox x={48} y={78} a={40} b={40} h={13} fills={[...FILLS.honey]} variants={drop(0, 0.1, 0.14, -30)} />
      <IsoBox x={48} y={65} a={34} b={34} h={13} fills={HONEY_FILLS} variants={drop(1, 0.1, 0.14, -30)} />
      <Float as="g" amplitude={2.5} duration={6.5} delay={0.6}>
        <Coin cx={48} cy={42} r={15} color={PAL.honey} face={PAL.butter} variants={pop(0.6)} />
        <motion.path
          variants={fade(0.9, 0.4)}
          d="M39 42 L46.5 48 L58 36"
          stroke={PAL.honey} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"
        />
      </Float>
    </Frame>
  );
}
