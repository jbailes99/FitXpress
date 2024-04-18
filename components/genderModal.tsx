// GenderExplanationModal.tsx
import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

interface GenderExplanationModalProps {
  isOpen: boolean
  onClose: () => void
}

const GenderExplanationModal: React.FC<GenderExplanationModalProps> = ({ isOpen, onClose }) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as='div' className='fixed inset-0 overflow-y-auto z-50' onClose={onClose}>
        <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Dialog.Overlay className='fixed inset-0 transition-opacity bg-secondary-500 bg-opacity-70' />
          </Transition.Child>

          <span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            enterTo='opacity-100 translate-y-0 sm:scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 translate-y-0 sm:scale-100'
            leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          >
            <div className='inline-block align-bottom bg-secondary-600 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
              <div className='px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                <div className='mt-3 text-center sm:mt-2'>
                  <Dialog.Title as='h2' className='text-2xl font-semibold leading-6 text-gray-300'>
                    Why only two genders?
                  </Dialog.Title>
                  <p className='mt-3 text-gray-300 text-left text-lg'>
                    This website is committed to an experience that welcomes people from all walks of life and promotes
                    body-positivity and gender fluidity. This application provides calculations and fitness guidance
                    based on body composition between biological sexes. For example, biological males have more muscle
                    mass and bone mass while having lower body fat than biological females. For this reason, we request
                    users to choose between these two options.
                  </p>
                </div>
              </div>
              <div className='px-4 py-3 flex justify-center items-center text-center sm:px-6 sm:flex sm:flex-row-reverse'>
                <button
                  type='button'
                  className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-medium-purple-600 text-base font-medium text-white hover:bg-medium-purple-800 focus:outline-none focus:ring focus:border-medium-purple-500 sm:ml-3 sm:w-auto sm:text-sm'
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default GenderExplanationModal
