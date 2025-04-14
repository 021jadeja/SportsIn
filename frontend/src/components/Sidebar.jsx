import { Link } from "react-router-dom";
import { Home, UserPlus, Bell } from "lucide-react";

export default function Sidebar({ user }) {
	return (
		<div
			className='bg-white border-r-4 rounded-xl shadow p-5'
			style={{ borderColor: "#22b7dc" }} // border-right color
		>
			<div className='text-center'>
				{/* Banner */}
				<div
					className='h-16 w-full rounded-t-lg bg-cover bg-center mb-[-32px]'
					style={{
						backgroundImage: `url(${user.bannerImg || "/banner.png"})`,
					}}
				/>

				{/* Profile Info */}
				<Link to={`/profile/${user.username}`}>
					<img
						src={user.profilePicture || "/avatar.png"}
						alt={user.name}
						className='w-20 h-20 object-cover mx-auto rounded-full bg-white border'
					/>
					<h2 className='text-lg font-semibold mt-2'>{user.name}</h2>
				</Link>
				<p className='text-gray-600 text-sm'>{user.headline}</p>
				<p className='text-xs text-gray-500 mt-1'>{user.connections.length} connections</p>
			</div>

			{/* Nav Menu */}
			<div className='mt-4'>
				<nav>
					<ul className='space-y-2'>
						<li>
							<Link
								to='/'
								className='flex items-center py-2 px-4 rounded-md hover:bg-blue-50 transition-colors'
							>
								<Home className='mr-2' size={20} /> Home
							</Link>
						</li>
						<li>
							<Link
								to='/network'
								className='flex items-center py-2 px-4 rounded-md hover:bg-blue-50 transition-colors'
							>
								<UserPlus className='mr-2' size={20} /> My Network
							</Link>
						</li>
						<li>
							<Link
								to='/notifications'
								className='flex items-center py-2 px-4 rounded-md hover:bg-blue-50 transition-colors'
							>
								<Bell className='mr-2' size={20} /> Notifications
							</Link>
						</li>
					</ul>
				</nav>
			</div>

			{/* Visit Profile Link */}
			<div className='mt-4 text-center'>
				<Link
					to={`/profile/${user.username}`}
					className='text-sm font-semibold hover:underline'
					style={{ color: "#22b7dc" }} // AliceBlue alternative
				>
					Visit your profile
				</Link>
			</div>
		</div>
	);
}
