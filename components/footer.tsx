export default function Footer() {

    
  return (
    <footer className="bg-secondary-800 flex flex-col items-center justify-center  text-center text-gray-300 py-4">
      <div className="container mx-auto px-4 items-center flex flex-col justify-center text-center">
        <div className="flex flex-wrap space-x-36 *:justify-between text-center items-center">
          <div className="w-full md:w-1/3 mb-4 md:mb-0 h-full">
            <h3 className="text-lg font-bold mb-2">Contact</h3>
            <div className="flex flex-col items-center">
              <i className="far fa-envelope mb-2"></i>
              <a href="mailto:contact@jbailes.com" className="text-gray-300 hover:text-gray-100">
                contact@jbailes.com
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/3 mb-4 md:mb-0 h-full">
            <h3 className="text-lg font-bold mb-2">Follow</h3>
            <div className="flex flex-row  justify-center text-center items-center space-x-8">
              <a
                href="https://www.linkedin.com/in/jbailes01/"
                className="text-gray-300 hover:text-gray-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin"></i> LinkedIn
              </a>
              <a
                href="https://jbailes.com"
                className="text-gray-300 hover:text-gray-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-globe"></i> jbailes.com
              </a>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-700" />
        <div className="text-center text-sm">
          <p>&copy; 2024 FitXpress. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
