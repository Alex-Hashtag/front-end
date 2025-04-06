import {Dialog} from '@headlessui/react'

interface AddToCartDialogProps
{
    isOpen: boolean
    onClose: () => void
    onContinueShopping: () => void
    onViewCart: () => void
}

export function AddToCartDialog({
                                    isOpen,
                                    onClose,
                                    onContinueShopping,
                                    onViewCart,
                                }: AddToCartDialogProps)
{
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true"/>

            {/* Dialog container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                {/* Dialog panel with custom styling */}
                <Dialog.Panel className="AddToCartDialog">
                    <Dialog.Title className="text-lg font-bold mb-4">
                        Item Added to Cart
                    </Dialog.Title>
                    <div className="AddToCartDialog-actions">
                        <button
                            onClick={() => {
                                onContinueShopping()
                                onClose()
                            }}
                            className="btn btn-secondary"
                        >
                            Continue Shopping
                        </button>
                        <button
                            onClick={() => {
                                onViewCart()
                                onClose()
                            }}
                            className="btn btn-primary"
                        >
                            View Cart
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}
