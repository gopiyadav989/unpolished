import { User} from "lucide-react";

export default function Profile() {
    return (
        <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center border border-gray-200 p-8 rounded-2xl shadow-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={32} className="text-gray-500" />
                    </div>
                    <h1 className="text-2xl font-semibold">Your Profile</h1>
                    <p className="text-sm text-gray-500">In the making..., till then read some blogs</p>
                </div>
            </div>
        </div>
    );
}
