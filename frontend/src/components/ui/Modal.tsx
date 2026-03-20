import * as Dialog from '@radix-ui/react-dialog'
import { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-cyber-surface border border-cyber-cyan shadow-cyber-cyan clip-cyber p-8">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="font-display text-lg text-cyber-cyan uppercase tracking-widest">
              {title}
            </Dialog.Title>
            <Dialog.Close
              onClick={onClose}
              className="text-cyber-muted hover:text-cyber-pink transition-colors font-mono text-lg"
            >
              ✕
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}