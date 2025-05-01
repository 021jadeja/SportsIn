import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link, useLocation } from "react-router-dom";
import { Bell, Home, LogOut, Users, Search, MessagesSquare } from "lucide-react"; // Removed User icon

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const location = useLocation();

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => axiosInstance.get("/notifications"),
    enabled: !!authUser,
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => axiosInstance.get("/connections/requests"),
    enabled: !!authUser,
  });

  const { mutate: logout } = useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const unreadNotificationCount = notifications?.data.filter((notif) => !notif.read).length;
  const unreadConnectionRequestsCount = connectionRequests?.data?.length;

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim()) {
        try {
          const { data } = await axiosInstance.get(`/users/search?term=${searchTerm}`);
          setSearchResults(data);
        } catch (error) {
          console.error("Error fetching search results", error);
        }
      } else {
        setSearchResults([]);
      }
    };
    fetchSearchResults();
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const isActive = (path) => location.pathname === path ? "bg-gray-200 rounded-md" : "";

  return (
    <nav className="bg-secondary shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img className="h-8 rounded" src="/small-logo.png" alt="SportsIn" />
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              {searchResults.length > 0 && searchTerm.trim() && (
                <div className="absolute left-0 w-full bg-white border mt-2 rounded-md shadow-lg z-50">
                  <ul>
                    {searchResults.map((user) => (
                      <li key={user._id} className="p-2 hover:bg-gray-100">
                        <Link to={`/profile/${user.username}`} className="flex items-center">
                          <img
                            src={user.profilePicture || "/default-profile.png"}
                            alt={user.username}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span>{user.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {authUser ? (
              <>
                <Link
                  to="/"
                  className={`text-neutral flex flex-col items-center px-3 py-2 ${isActive("/")}`}
                >
                  <Home size={20} />
                  <span className="text-xs hidden md:block">Home</span>
                </Link>

                <Link
                  to="/network"
                  className={`text-neutral flex flex-col items-center relative px-3 py-2 ${isActive("/network")}`}
                >
                  <Users size={20} />
                  <span className="text-xs hidden md:block">Network</span>
                  {unreadConnectionRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs rounded-full size-3 md:size-4 flex items-center justify-center">
                      {unreadConnectionRequestsCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/messages"
                  className={`text-neutral flex flex-col items-center relative px-3 py-2 ${isActive("/messages")}`}
                >
                  <MessagesSquare size={20} />
                  <span className="text-xs hidden md:block">Messages</span>
                </Link>

                <Link
                  to="/notifications"
                  className={`text-neutral flex flex-col items-center relative px-3 py-2 ${isActive("/notifications")}`}
                >
                  <Bell size={20} />
                  <span className="text-xs hidden md:block">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs rounded-full size-3 md:size-4 flex items-center justify-center">
                      {unreadNotificationCount}
                    </span>
                  )}
                </Link>

                {/* Profile Picture instead of Me icon */}
                <Link
                  to={`/profile/${authUser.username}`}
                  className={`text-neutral flex flex-col items-center px-3 py-2 ${isActive(`/profile/${authUser.username}`)}`}
                >
                  <img
                    src={authUser.profilePicture || "/default-profile.png"}
                    alt="Profile"
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover ring-1 ring-gray-300"
                  />
                  <span className="text-xs hidden md:block">Me</span>
                </Link>

                <button
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => logout()}
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Sign In</Link>
                <Link to="/signup" className="btn btn-primary">Join now</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
