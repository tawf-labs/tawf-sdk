import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Float, FlowLine, IsoBox, FILLS, PAL, draw, drop, fade, pop, isoAt, type Pt } from '../../motion';
import Coin from './Coin';

/* Hero art: package blocks assemble into two joined stacks. Identity is green, notarization is honey, and a bridge
 * with a record travelling along it joins them. Every coordinate comes from one iso frame: O is the floor origin,
 * u runs up-right, v down-right. */
const O: Pt = [96, 330];
const at = (u: number, v: number, z = 0): Pt => { const p = isoAt(O[0], O[1], u, v); return [p[0], p[1] - z]; };
/* A box centred on (u, v), resting at height z. */
const box = (u: number, v: number, a: number, b: number, h: number, z = 0) => {
  const p = at(u - a / 2, v + b / 2, z);
  return { x: p[0], y: p[1], a, b, h };
};

const HONEY_FILLS: [string, string, string] = ['#E6D294', '#D4BE7C', PAL.butter];
const GREEN: [string, string, string][] = [[...FILLS.zakat], [...FILLS.waqf], [...FILLS.paper]];
const HONEY: [string, string, string][] = [[...FILLS.honey], HONEY_FILLS, HONEY_FILLS, [...FILLS.honey]];

const FLOOR_Z = 10, BH = 20;
const U1 = 78, U2 = 238;                 // stack centres along the path
const SIZES = [64, 56, 48, 40];
const INTRO = 2.8;

export default function PackageStackArt({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setArmed(true), INTRO * 1000);
    return () => window.clearTimeout(t);
  }, [reduce]);
  const root = useRef<SVGSVGElement>(null);

  const floor = box((U1 + U2) / 2, 0, 340, 120, 10);
  const shadow = at(U1 / 2 + U2 / 2, 0);
  const BZ = FLOOR_Z + 4, bu1 = U1 + SIZES[0] / 2 - 6, bu2 = U2 - SIZES[0] / 2 + 6;
  const bridge = box((bu1 + bu2) / 2, 0, bu2 - bu1, 16, 10, BZ);
  const beadD = `M${at(bu1 + 2, 0, BZ + 10).join(' ')} L${at(bu2 - 2, 0, BZ + 10).join(' ')}`;

  const green = [0, 1, 2].map((i) => ({ ...box(U1, 0, SIZES[i], SIZES[i], BH, FLOOR_Z + i * BH), fills: GREEN[i] }));
  const honey = [0, 1, 2, 3].map((i) => ({ ...box(U2, 0, SIZES[i], SIZES[i], BH, FLOOR_Z + i * BH), fills: HONEY[i] }));
  const gTop = at(U1, 0, FLOOR_Z + 3 * BH + 6), hTop = at(U2, 0, FLOOR_Z + 4 * BH + 6);

  return (
    <motion.svg
      ref={root}
      viewBox="20 40 480 340"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      focusable="false"
      initial={reduce ? false : 'hidden'}
      animate="show"
    >
      <motion.ellipse variants={fade(0.05, 0.7)} cx={shadow[0] + 6} cy={shadow[1] + 26} rx={215} ry={72} fill="rgba(16,38,31,.07)" />

      <IsoBox {...floor} fills={[...FILLS.paper]} variants={drop(0, 0.1, 0.16, -36)} />

      {/* the notarization stack sits further along the path, so it is drawn first */}
      {honey.map((b, i) => {
        const top = i === honey.length - 1;
        const el = <IsoBox key={i} {...b} fills={b.fills} variants={drop(i, 1.25, 0.16, -60)} />;
        return top ? (
          <Float key={i} as="g" amplitude={5} duration={7} delay={1.4} run={armed}>
            {el}
            <Coin cx={hTop[0]} cy={hTop[1]} r={12} color={PAL.honey} face={PAL.butter} variants={pop(2.1)} />
          </Float>
        ) : el;
      })}

      {/* the bridge, with a record travelling across it */}
      <IsoBox {...bridge} fills={[...FILLS.zakat]} variants={drop(0, 1.9, 0.16, -30)} />
      <motion.path variants={draw(2.2, 0.5)} d={beadD} stroke={PAL.paper} strokeOpacity=".5" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <FlowLine d={beadD} stroke={PAL.butter} strokeWidth={5} dash="0.01 24.99" duration={3.2} startAfter={INTRO} hideWhenStill={false} />

      {green.map((b, i) => {
        const top = i === green.length - 1;
        const el = <IsoBox key={i} {...b} fills={b.fills} variants={drop(i, 0.35, 0.16, -60)} />;
        return top ? (
          <Float key={i} as="g" amplitude={5} duration={8} delay={0.2} run={armed}>
            {el}
            <Coin cx={gTop[0]} cy={gTop[1]} r={12} color={PAL.accent} face={PAL.mint} variants={pop(1.6)} />
          </Float>
        ) : el;
      })}
    </motion.svg>
  );
}
