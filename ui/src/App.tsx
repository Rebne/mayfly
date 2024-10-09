function App() {
  return (
    <>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="flex justify-center">
            <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="black" />
              <path d="M25 25 L35 25 L50 50 L65 25 L75 25 L75 75 L65 75 L65 40 L50 65 L35 40 L35 75 L25 75 Z"
                fill="white" />
            </svg>
          </div>
          <form id="noteForm" className="mb-6">
            <div className="flex items-center border-b border-gray-300 py-2">
              <input type="text" name="content" id="noteInput" required
                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                autoComplete="off" />
            </div>
          </form>
          <ul className="space-y-2">
            <li id="note-1" className="bg-gray-50 rounded p-3 shadow"></li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default App
