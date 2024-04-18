// SuccessfulSignUpModal.tsx

import React from 'react'
import { Dialog, Transition } from '@headlessui/react'

interface SuccessModalProps {
  open: boolean
  onClose: () => void
}

const SuccessfulSignUpModal: React.FC<SuccessModalProps> = ({ open, onClose }) => {
  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as='div' className='fixed inset-0 z-10 overflow-y-auto' onClose={onClose}>
        <div className='flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0'>
          {/* Your modal content for successful sign-up */}
          <Dialog.Overlay className='fixed inset-0 bg-black opacity-30' />

          <div className='fixed inset-0 my-6 sm:max-w-lg sm:w-full mx-auto p-4 bg-white rounded-md overflow-hidden shadow-xl transform transition-all'>
            <div>
              <p className='text-lg font-semibold'>Sign-up successful! Welcome to our platform.</p>
            </div>

            <div className='mt-4'>
              <button onClick={onClose} className='px-4 py-2 bg-blue-500 text-white rounded-md'>
                Close
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default SuccessfulSignUpModal
