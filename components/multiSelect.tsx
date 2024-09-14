// import React, { useState } from 'react'

// const categories = ['Strength Training', 'Cardio', 'Yoga', 'Pilates'] // Example categories

// const MultiSelect = () => {
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([])

//   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const { options } = e.target
//     const selectedOptions: string[] = []

//     for (let i = 0; i < options.length; i++) {
//       if (options[i].selected) {
//         selectedOptions.push(options[i].value)
//       }
//     }

//     setSelectedCategories(selectedOptions)
//   }

//   return (
//     <div className='relative mt-4'>
//       <label className='block text-sm font-medium mb-2'>Select Workout Category:</label>
//       <select
//         multiple
//         className='p-2 border border-gray-300 rounded-md w-full bg-white text-gray-800 dark:bg-neutral-900 dark:text-neutral-400'
//         value={selectedCategories}
//         onChange={handleChange}
//       >
//         <option value='' disabled>
//           Select a Workout Category
//         </option>
//         {categories.map(category => (
//           <option
//             key={category}
//             value={category}
//             className='py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800'
//           >
//             {category}
//           </option>
//         ))}
//       </select>
//       <div className='absolute top-1/2 right-3 transform -translate-y-1/2'>
//         <svg
//           className='w-6 h-6 text-gray-500 dark:text-neutral-500'
//           xmlns='http://www.w3.org/2000/svg'
//           viewBox='0 0 24 24'
//           fill='none'
//           stroke='currentColor'
//           strokeWidth='2'
//           strokeLinecap='round'
//           strokeLinejoin='round'
//         >
//           <path d='m7 15 5 5 5-5' />
//           <path d='m7 9 5-5 5 5' />
//         </svg>
//       </div>
//     </div>
//   )
// }

// export default MultiSelect
