import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
    children: ReactNode
}

function PageTransition({ children }: Props) {
    return (
        <motion.div
            initial={{
                opacity: 0
            }}
            animate={{
                opacity: 1
            }}
            exit={{
                opacity: 0
            }}
            transition={{
                duration: 0.45,
                ease: 'easeInOut'
            }}
        >
            {children}
        </motion.div>
    )
}

export default PageTransition