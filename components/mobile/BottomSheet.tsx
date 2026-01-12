'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export default function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Overlay */}
                            <Dialog.Overlay asChild>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 z-50"
                                />
                            </Dialog.Overlay>

                            {/* Content */}
                            <Dialog.Content asChild>
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                    className={cn(
                                        "fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col",
                                        className
                                    )}
                                >
                                    {/* Handle */}
                                    <div className="flex justify-center pt-3 pb-2">
                                        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                    </div>

                                    {/* Header */}
                                    {title && (
                                        <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <Dialog.Title className="text-lg font-black text-slate-900 dark:text-white">
                                                {title}
                                            </Dialog.Title>
                                            <Dialog.Close asChild>
                                                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                    <X className="w-5 h-5 text-slate-400" />
                                                </button>
                                            </Dialog.Close>
                                        </div>
                                    )}

                                    {/* Body */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        {children}
                                    </div>
                                </motion.div>
                            </Dialog.Content>
                        </>
                    )}
                </AnimatePresence>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
