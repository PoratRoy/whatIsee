export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            whatIsee
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your personal movie gallery to track and share what you watch
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to whatIsee
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Start building your movie collection and share your viewing
              experiences with friends.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
