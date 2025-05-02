import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { Blog } from '../cacheService';

// Custom date formatting utility
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDate(date: Date, formatStr: string): string {
  const map: Record<string, string> = {
    'yyyy': date.getFullYear().toString(),
    'MMMM': monthNames[date.getMonth()],
    'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
    'dd': date.getDate().toString().padStart(2, '0'),
    'd': date.getDate().toString(),
  };
  return formatStr.replace(/yyyy|MMMM|MM|dd|d/g, (token) => map[token]);
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true);
      try {

        const token = localStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/blog/${slug}`, {
          headers: token ? { Authorization: token } : {}
        });
        setPost(res.data.blog);
      } catch (e) {
        console.error(e);
        setError('Unable to load the blog post.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 max-w-3xl w-full p-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-600">{error}</p>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <article className="prose prose-lg prose-slate mx-auto my-8 p-4 max-w-3xl font-serif">
      <Link to="/" className="flex items-center mb-6 text-gray-600 hover:text-gray-800">
        <ArrowLeft size={24} />
        <span className="ml-2">Back to Home</span>
      </Link>

      <h1 className="text-4xl font-bold leading-tight">{post!.title}</h1>
      <div className="flex items-center text-gray-500 space-x-4 mt-2">
        <span className="text-sm">
          {formatDate(new Date(post!.publishedAt || post!.updatedAt), 'MMMM d, yyyy')}
        </span>
        <div className="flex items-center text-sm">
          <User size={16} />
          <span className="ml-1">{post!.author.name || post!.author.username}</span>
        </div>
      </div>

      {post!.featuredImage && (
        <img
          src={post!.featuredImage}
          alt={post!.title}
          className="w-full rounded-lg mt-6 shadow-md"
        />
      )}

      <section className="mt-8">
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post!.content }}
        />
      </section>

      <footer className="mt-16 border-t pt-8">
        <p className="text-gray-600 text-sm">Enjoyed this post? Share it with friends!</p>
      </footer>
    </article>
  );
}
