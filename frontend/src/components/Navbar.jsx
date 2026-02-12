import { useDocument } from '../context/DocumentContext';

export default function Navbar() {
  const { user, logout } = useDocument();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Legal AI System</h1>
          <p className="text-sm text-blue-100">Multilingual Document Simplification & Analysis</p>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.name}</span>
            <button onClick={logout} className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
