export default function Footer() {
  return (
    <footer className="bg-secondary-800 ">
      <div className="w-full mx-auto md:w-1/3 mb-4 md:mb-0 h-full p-2">
        <h3 className="text-md font-bold justify-center items-center text-gray-200 flex flex-col">
          Contact
        </h3>
        <div className="flex items-center justify-center mt-2 space-x-2">
          <i className="far fa-envelope text-gray-300"></i>
          <a
            href="mailto:contact@jbailes.com"
            className="text-gray-300 text-sm hover:text-medium-purple-200"
          >
            contact@jbailes.com
          </a>
        </div>
      </div>
      <div className="flex items-end justify-center mt-auto pb-2 ">
        <h1 className="text-medium-purple-500 text-xs  font-bold">FitXpress</h1>
      </div>
    </footer>
  )
}
