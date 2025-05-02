
import { useNavigate } from "react-router-dom";
import { BlogFeed } from "../components/BlogFeed";
import { Header } from "../components/Header";
import { useEffect } from "react";

export default function Home() {

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) navigate("/signin");
    }, []);


    return (
        <div className="font-serif bg-white min-h-screen">

            <Header />

            <BlogFeed />
        </div>
    );
}

