'use client'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/** Wraps any section with a whileInView fade-up entrance; respects prefers-reduced-motion */
export function AnimatedSectionWrapper({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
