const UnauthorizedPage = () => {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2 text-gray-700">You are not authorized to view this page.</p>
          <a href="/" className="mt-4 block text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  };
  
  export default UnauthorizedPage;
  