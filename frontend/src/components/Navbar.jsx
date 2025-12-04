//src\components\Navbar.jsx
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Navbar() {
  const { user } = useSelector((state) => state.auth);

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Social App
          </Link>
          
          <div className="flex space-x-4">
            {user ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                <Link to="/create-post" className="text-gray-600 hover:text-gray-900">Create Post</Link>
                <Link to="/messages" className="text-gray-600 hover:text-gray-900">Messages</Link>
                <Link to={`/profile/${user?.id}`} className="text-gray-600 hover:text-gray-900">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                <Link to="/register" className="text-gray-600 hover:text-gray-900">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar