import { useEffect} from "react";
import { BlogFeed } from "../components/BlogFeed";
import { Header } from "../components/Header";

export default function Home() {

    useEffect(() => {
        const onLogout = () => {
            window.location.reload();
        };

        window.addEventListener('logout', onLogout);
        return () => {
            window.removeEventListener('logout', onLogout);
        };
    }, []);

    return (
        <div className="font-serif bg-white min-h-screen">

            <Header />
            <BlogFeed />
        </div>
    );
}

