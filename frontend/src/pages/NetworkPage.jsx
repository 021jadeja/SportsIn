import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import { UserPlus, Search } from "lucide-react";
import FriendRequest from "../components/FriendRequest";
import UserCard from "../components/UserCard";

const NetworkPage = () => {
	const [searchTerm, setSearchTerm] = useState("");

	const { data: user } = useQuery({ queryKey: ["authUser"] });

	const { data: connectionRequests } = useQuery({
		queryKey: ["connectionRequests"],
		queryFn: () => axiosInstance.get("/connections/requests"),
	});

	const { data: connections } = useQuery({
		queryKey: ["connections"],
		queryFn: () => axiosInstance.get("/connections"),
	});

	// Filtered connections based on search term
	const filteredConnections = connections?.data?.filter((connection) =>
		connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		connection.username.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='col-span-1 lg:col-span-1'>
				<Sidebar user={user} />
			</div>
			<div className='col-span-1 lg:col-span-3'>
				<div className='bg-secondary rounded-lg shadow p-6 mb-6'>
					<h1 className='text-2xl font-bold mb-6'>My Network</h1>

					{/* Search input */}
					<div className='relative mb-6'>
						<input
							type='text'
							placeholder='Search profiles by name or username...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
						<Search className='absolute left-3 top-2.5 text-gray-400' size={20} />
					</div>

					{/* Connection Requests */}
					{connectionRequests?.data?.length > 0 ? (
						<div className='mb-8'>
							<h2 className='text-xl font-semibold mb-2'>Connection Request</h2>
							<div className='space-y-4'>
								{connectionRequests.data.map((request) => (
									<FriendRequest key={request.id} request={request} />
								))}
							</div>
						</div>
					) : (
						<div className='bg-white rounded-lg shadow p-6 text-center mb-6'>
							<UserPlus size={48} className='mx-auto text-gray-400 mb-4' />
							<h3 className='text-xl font-semibold mb-2'>No Connection Requests</h3>
							<p className='text-gray-600'>
								You don&apos;t have any pending connection requests at the moment.
							</p>
							<p className='text-gray-600 mt-2'>
								Explore suggested connections below to expand your network!
							</p>
						</div>
					)}

					{/* My Connections */}
					{filteredConnections?.length > 0 && (
						<div className='mb-8'>
							<h2 className='text-xl font-semibold mb-4'>My Connections</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{filteredConnections.map((connection) => (
									<UserCard key={connection._id} user={connection} isConnection={true} />
								))}
							</div>
						</div>
					)}

					{/* No results after search */}
					{filteredConnections?.length === 0 && (
						<div className='text-center text-gray-600'>
							No profiles found matching "{searchTerm}"
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default NetworkPage;
