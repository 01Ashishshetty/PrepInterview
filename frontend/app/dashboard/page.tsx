export default function DashboardPage() {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to Dashboard</h1>
        <p className="text-gray-600 mt-4">You are successfully logged in!</p>
        
        <a href="/login" className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
          Logout
        </a>
      </div>
    );
  }
  