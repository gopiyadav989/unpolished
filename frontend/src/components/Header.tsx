import { LogOut, PencilLine, Search, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import cacheService from "../cacheService";


export function Header() {
	const [searchQuery, setSearchQuery] = useState("");
	const [showUserMenu, setShowUserMenu] = useState(false);
	const userMenuRef = useRef<HTMLDivElement | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const userButtonRef = useRef<HTMLButtonElement | null>(null);
	const [userId, setUserId] = useState<null | string>(null);
	const [username, setUsername] = useState<null | string>(null);


	useEffect(() => {

		const storedImageUrl = localStorage.getItem('profileImage');
		const storedUserId = localStorage.getItem('userId');
		const storedUsername = localStorage.getItem('username');


		if (storedImageUrl && storedImageUrl !== 'null') {
			setImageUrl(storedImageUrl);
		} else {
			setImageUrl(null);
		}

		setUserId(storedUserId);
		setUsername(storedUsername);


	}, [])


	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {

			if (
				showUserMenu &&
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node) &&
				userButtonRef.current &&
				!userButtonRef.current.contains(event.target as Node)
			) {
				setShowUserMenu(false);
			}

		};

		if (showUserMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showUserMenu])

	const handleSignout = () => {
		localStorage.clear();
		cacheService.clearCache();

		setImageUrl(null);
		setUserId(null);
		setUsername(null);

		localStorage.removeItem('token');
		window.dispatchEvent(new Event('logout'));
		setShowUserMenu(false);
	}


	return (
		<header>
			{/* logo bar */}
			<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center justify-between">
					<Link to={"/"} className="text-3xl font-bold mr-8">U.</Link>

					{/* Search bar for desktop */}
					<div className="hidden md:block w-64 lg:w-80">
						<SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
					</div>
				</div>

				{/* User actions */}
				<div className="flex items-center gap-4">
					<Link
						to="i-still-miss-her"
						className="flex items-center gap-2 px-4 py-2 text-sm rounded-full border border-gray-300 hover:bg-gray-100 transition-colors no-underline text-gray-700"
					>
						<PencilLine size={16} />
						<span className="hidden md:inline">Write</span>
					</Link>

					{/* If user is logged in, show avatar and menu. */}
					{userId ? (
						<div className="relative">
							<button
								ref={userButtonRef}
								className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
								onClick={() => setShowUserMenu(!showUserMenu)}
								aria-label="User menu"
								aria-expanded={showUserMenu}
								aria-controls="user-menu"
							>
								{!imageUrl ? (
									<User size={18} className="text-gray-700" />
								) : (
									<img
										src={imageUrl}
										alt="User avatar"
										className="w-full h-full rounded-full object-cover"
									/>
								)}
							</button>

							{showUserMenu && (
								<div ref={userMenuRef} id={"user-menu"} className={"absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-100"}>
									{username && (
										<div className="px-4 py-3 border-b border-gray-100">
											<p className="text-sm font-medium text-gray-900 truncate">@{username}</p>
										</div>
									)}
									<Link
										to={`/profile/${username}`}
										className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
										onClick={() => setShowUserMenu(false)}
									>
										<User size={16} />
										View Profile
									</Link>

									<div className="border-t border-gray-100 my-1"></div>
									<button
										onClick={handleSignout}
										className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-red-50"
									>
										<LogOut size={16} />
										Sign out
									</button>
								</div>
							)}
						</div>
					) : (
						// user is not logged in -> show Sign In button.
						<Link
							to="/signin"
							className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-full hover:bg-gray-700 transition-colors no-underline"
						>
							Sign In
						</Link>
					)}
				</div>
			</div>

			{/* search bar for mobile */}
			<div className="md:hidden px-4 py-3">
				<SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
			</div>


		</header>
	)
}


const SearchBar = ({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
	<div className="relative">
		<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
		<input
			type="text"
			placeholder="Search something..."
			className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400"
			value={value}
			onChange={onChange}
		/>
	</div>
);