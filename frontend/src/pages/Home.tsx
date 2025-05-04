
import { BlogFeed } from "../components/BlogFeed";
import { Header } from "../components/Header";

export default function Home() {

    return (
        <div className="font-serif bg-white min-h-screen">

            <Header />
            <BlogFeed />
        </div>
    );
}

