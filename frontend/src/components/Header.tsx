import { LogOut, PencilLine, Search, Settings, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";


export function Header() {

	const [searchQuery, setSearchQuery] = useState("");
	const [showUserMenu, setShowUserMenu] = useState(false);
	const userMenuRef = useRef<HTMLDivElement | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const userButtonRef = useRef<HTMLButtonElement | null>(null);
	const [userId, setUserId] = useState<null | string>(null);


	useEffect(() => {
		setImageUrl(localStorage.getItem('profileImage'))
		setUserId(localStorage.getItem('userId'))
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
		setShowUserMenu(false);
	}

	return (
		<header>
			{/* logo bar */}
			<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold mr-8">U.</h1>

					{/* Search bar */}
					<div className="hidden md:block w-64 lg:w-80">
						<SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
					</div>
				</div>

				{/* User actions */}
				<div className="flex items-center gap-4">
					<Link
						to="/i-still-miss-her"
						className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
					>
						<PencilLine size={16} />
						<span className="hidden md:inline">Write</span>
					</Link>

					<div className="relative">
						<button
							ref={userButtonRef}
							className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
							onClick={() => setShowUserMenu(!showUserMenu)}
							aria-label="User menu"
							aria-expanded={showUserMenu}
							aria-controls="user-menu"
						>
							{!imageUrl ? <User size={18} className="text-gray-700" /> : <img src={imageUrl} alt="User avatar" className="w-8 h-8 rounded-full object-cover" />}
						</button>

						{showUserMenu && (
							<div ref={userMenuRef} id={"user-menu"} className={"absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-100"}>
								<Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
									<User size={16} />
									Profile
								</Link>
								<Link to="/settings" className={"flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"}>
									<Settings size={16} />
									Settings
								</Link>
								{userId ? (
									<button onClick={handleSignout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
										<LogOut size={16} />
										Sign out
									</button>
								) : (
									<Link to="/signin" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
										<User size={16} />
										Sign in
									</Link>
								)}

							</div>
						)}
					</div>
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