import { useState } from 'react';
import { Clock, Bookmark, MessageSquare, Copy } from 'lucide-react';
import { formatDate } from "../utils";
import { Link } from 'react-router-dom';

// Blog card interface
interface BlogCardProps {
    slug: string;
    title: string;
    excerpt?: string;
    featuredImage?: string;
    publishedAt?: string;
    author: {
        name?: string;
        username: string;
        profileImage?: string | null;
    };
    readTime?: number;
    commentCount?: number;
}

export default function BlogCard({
    slug,
    title,
    excerpt,
    featuredImage,
    publishedAt,
    author,
    readTime = 5,
    commentCount = 0
}: BlogCardProps) {
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {

        // This will be implemented later with a backend call
        setSaved(!saved);
    };

    // copying blog link
    const handleShare = () => {
        const url = `${window.location.origin}/${slug}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div className="group py-8 px-4 md:px-6 transition-all hover:bg-gray-50 border-b border-gray-100 mx-auto">
            <div className="flex md:gap-6 max-w-3xl mx-auto justify-between">


                <div className="flex flex-col justify-between order-2 md:order-1 md:w-2/3 w-full">
                    <div className='flex justify-between'>
                        <div>
                            {/* Author */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                    {author?.profileImage ? (
                                        <img
                                            src={author.profileImage}
                                            alt={author?.name || author?.username}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-medium">{author?.username?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {author?.name || author?.username}
                                </span>
                            </div>

                            {/* Title */}
                            <Link to={`/${slug}`} className="block font-serif text-xl md:text-2xl font-bold leading-tight mb-2 hover:text-gray-700">
                                {title}
                            </Link>

                            {/* Excerpt */}
                            {excerpt && (
                                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                    {excerpt}
                                </p>
                            )}
                        </div>

                        <div className='flex justify-center items-center md:hidden'>
                            <div className="w-24 h-20 md:w-40 md:h-28 overflow-hidden rounded-lg ">
                                {featuredImage && (
                                    <img
                                        src={featuredImage || ""}
                                        alt={title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between mt-3">
                        <div className="flex items-center flex-wrap gap-3 md:gap-4 text-sm text-gray-500">
                            <span>{publishedAt ? formatDate(publishedAt) : 'Draft'}</span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {readTime} min read
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare size={14} />
                                {commentCount}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                            <button
                                onClick={handleCopy}
                                className={`p-1.5 rounded-full transition-colors ${saved ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                aria-label={saved ? "Unsave article" : "Save article"}
                                title={saved ? "Unsave article" : "Save article"}
                            >
                                <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 transition-colors relative"
                                aria-label="Copy link"
                                title="Copy link"
                            >
                                <Copy size={18} />
                                {copied && (
                                    <span className="absolute -top-8 -left-3 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                        Copied!
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>


                <div className="hidden md:flex md:order-2 justify-center items-center">
                    <div className="w-40 h-28 overflow-hidden rounded-lg ">
                        {featuredImage && (
                            <img
                                src={featuredImage || ""}
                                alt={title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        )}
                    </div>
                </div>




            </div>
        </div>
    );
}