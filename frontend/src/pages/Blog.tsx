import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Editor } from "../components/Editor";
import cacheService from "../cacheService";
import { ToastContainer } from "../components/ui/Toast";
import { sleep } from "../utils";
import { generateExcerpt, calculateReadingTime } from "../utils/index";
import { BACKEND_URL } from "../config";
import axios from "axios";

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage?: string;
  content: string;

  // SEO fields
  metaTitle?: string;
  metaDescription?: string;

  // Status and publishing
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  publishedAt?: string;
  scheduledFor?: string;

  // Engagement stats
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  shareCount: number;

  // Reading time in minutes
  readingTime?: number;

  // Content settings
  allowComments: boolean;
  isPremium: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  author: {
    id: string;
    name?: string;
    username: string;
    profileImage?: string;
  };
}

export default function Blog() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(JSON.stringify([{ type: "paragraph", content: "" }]));
  const [excerpt, setExcerpt] = useState("");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [scheduledFor, setScheduledFor] = useState("");

  const [featuredImage, setFeaturedImage] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // UI state
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'>('DRAFT');
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchBlog(slug);
    }
  }, [slug]);




  const fetchBlog = async (slug: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (slug === 'i-still-miss-her') {

        const cachedBlog = await cacheService.getRecentlyEditedBlog();
        if (cachedBlog) {
          setBlog(cachedBlog);
          setTitle(cachedBlog.title);
          setContent(cachedBlog.content);
          setExcerpt(cachedBlog.excerpt || "");
          setFeaturedImage(cachedBlog.featuredImage || "");
          setMetaTitle(cachedBlog.metaTitle || "");
          setMetaDescription(cachedBlog.metaDescription || "");
          setScheduledFor(cachedBlog.scheduledFor || "");
          setAllowComments(cachedBlog.allowComments ?? true);
          setIsPremium(cachedBlog.isPremium ?? false);
          setStatus(cachedBlog.status);
        }

        setIsAuthor(true);
        setEditMode(true);

        setIsLoading(false);
        return;

      }

      const cachedBlog = await cacheService.getRecentlyOpenedBlog(slug);

      if (cachedBlog) {

        setBlog(cachedBlog);
        setTitle(cachedBlog.title);
        setContent(cachedBlog.content);
        setExcerpt(cachedBlog.excerpt || "");
        setFeaturedImage(cachedBlog.featuredImage || "");
        setMetaTitle(cachedBlog.metaTitle || "");
        setMetaDescription(cachedBlog.metaDescription || "");
        setScheduledFor(cachedBlog.scheduledFor || "");
        setAllowComments(cachedBlog.allowComments ?? true);
        setIsPremium(cachedBlog.isPremium ?? false);
        setStatus(cachedBlog.status);

        const userId = localStorage.getItem('userId');
        const isOwner = userId === cachedBlog.author.id;

        setIsAuthor(isOwner);
        setEditMode(isOwner && cachedBlog.status === 'DRAFT');
        setIsLoading(false);
        return;

      }

      try {
        const res = await axios.get(`${BACKEND_URL}/blog/${slug}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });

        const blogData = res.data.blog;
        const userId = localStorage.getItem('userId');
        const isOwner = blogData.author.id === userId;

        setBlog(blogData);
        setTitle(blogData.title);
        setContent(blogData.content);
        setExcerpt(blogData.excerpt || "");
        setFeaturedImage(blogData.featuredImage || "");
        setMetaTitle(blogData.metaTitle || "");
        setMetaDescription(blogData.metaDescription || "");
        setScheduledFor(blogData.scheduledFor || "");
        setAllowComments(blogData.allowComments ?? true);
        setIsPremium(blogData.isPremium ?? false);
        setStatus(blogData.status);
        setIsAuthor(isOwner);
        setEditMode(isOwner && blogData.status === 'DRAFT');

        await cacheService.cacheRecentlyOpenedBlog(blogData);
      }
      catch (e: any) {
        if (e.response.status === 404) {
          navigate("/not-found");
        }
        else {
          console.error("Error fetching blog:", e);
          setError("Failed to load blog post. Please try again later.");
        }

      }

    }
    catch (e) {
      console.log("error while showing you blog: ", e);
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleSave = async (publishStatus: boolean) => {

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      console.log(token)

      if (!token) {


        window.toast.error("Sign In please");
        await sleep(2000);

        navigate("/signin");
        return;
      }

      const blogData = {
        title,
        content,
        excerpt: excerpt || generateExcerpt(content),
        featuredImage: featuredImage || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        scheduledFor: scheduledFor || undefined,
        allowComments,
        isPremium,
        readingTime: calculateReadingTime(content),
        status: publishStatus ? 'PUBLISHED' : 'DRAFT'
      };

      let response;

      console.log(blogData);

      if (blog?.id) {
        response = await axios.put(`${BACKEND_URL}/blog`, { ...blogData, id: blog.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.toast.success("sucessfully published");
      } else {

        response = await axios.post(`${BACKEND_URL}/blog`, blogData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        window.toast.success("in draft, success");
      }

      await cacheService.cacheRecentlyOpenedBlog(response.data.blog);
      navigate(`/${response.data.blog.slug}`);


      setStatus(publishStatus ? 'PUBLISHED' : 'DRAFT');
      setBlog(response.data.blog);

      if (publishStatus === true) {
        setEditMode(false);
      }

      if (slug === "i-still-miss-her") {    // restricting only for "i-still-miss-her"

        const emptyBlog: Blog = {
          id: '',
          slug: "i-still-miss-her",
          title: '',
          content: JSON.stringify([{ type: "paragraph", content: "" }]),
          excerpt: '',
          featuredImage: '',
          metaTitle: '',
          metaDescription: '',
          status: 'DRAFT',
          publishedAt: undefined,
          scheduledFor: undefined,
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          bookmarkCount: 0,
          shareCount: 0,
          readingTime: 1,
          allowComments: true,
          isPremium: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: '',
            username: ''
          }
        };
        await cacheService.cacheRecentlyEditedBlog(emptyBlog);

      }


    } catch (error) {
      console.error("Error saving blog:", error);
    } finally {
      setIsSaving(false);
    }
  };


  const handleEditorChange = (value: string) => {
    setContent(value);

    if (slug === 'i-still-miss-her') {

      const editingBlog: Blog = {
        id: blog?.id || '',
        slug: 'i-still-miss-her',
        title,
        excerpt,
        content: value,
        featuredImage: featuredImage || '',
        metaTitle: metaTitle || '',
        metaDescription: metaDescription || '',
        status: 'DRAFT',
        publishedAt: undefined,
        scheduledFor: scheduledFor || undefined,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        bookmarkCount: 0,
        shareCount: 0,
        readingTime: calculateReadingTime(value),
        allowComments,
        isPremium,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: '',
          username: ''
        }
      };
      cacheService.cacheRecentlyEditedBlog(editingBlog);

    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);

    if (slug === "i-still-miss-her") {
      const currentDraft: Blog = {
        id: blog?.id || '',
        slug: "i-still-miss-her",
        title: e.target.value,
        excerpt: excerpt,
        content,
        featuredImage: featuredImage || '',
        metaTitle: metaTitle || '',
        metaDescription: metaDescription || '',
        status: 'DRAFT',
        publishedAt: undefined,
        scheduledFor: scheduledFor || undefined,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        bookmarkCount: 0,
        shareCount: 0,
        readingTime: calculateReadingTime(content),
        allowComments,
        isPremium,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: '',
          username: ''
        }
      };
      cacheService.cacheRecentlyEditedBlog(currentDraft);
    }


  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => slug ? fetchBlog(slug) : navigate("/")}
          className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          Try Again
        </button>
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-white font-serif">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">

            <div className="flex items-center">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <span className="ml-4 font-medium text-gray-500">
                {editMode ? (slug ? "Editing post" : "New post") : ""}
              </span>
            </div>

            {isAuthor && (
              <div className="flex items-center space-x-3">
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSave(false)}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center"
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      Save Draft
                    </button>
                    <button
                      onClick={() => handleSave(true)}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-full text-sm bg-black text-white hover:bg-gray-800 flex items-center"
                    >
                      {isSaving ? <Loader2 className="w-10 h-5 mr-1.5 animate-spin" /> : status === 'PUBLISHED' ? "Update" : "Publish"}
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {editMode ? (
          <>
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Title"
              className="text-4xl font-bold w-full outline-none border-none mb-8 focus:ring-0 placeholder-gray-300"
            />

            {/* Editor */}
            <Editor
              initialContent={content}
              onChange={handleEditorChange}
              editable={true}
            />
          </>
        ) : (
          <>
            {/* Read-only view */}
            <h1 className="text-4xl font-bold mb-6">{title}</h1>

            {blog && blog.author && (
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                  {blog.author.profileImage ? (
                    <img src={blog.author.profileImage} alt={blog.author.name || blog.author.username} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-500">{(blog.author.name || blog.author.username)?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{blog.author.name || blog.author.username}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(blog.publishedAt || blog.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    {blog.publishedAt && blog.updatedAt && blog.publishedAt !== blog.updatedAt && " (updated)"}
                    {' · '}{blog.readingTime || calculateReadingTime(content)} min read
                  </p>
                </div>
              </div>
            )}

            <Editor
              initialContent={content}
              onChange={() => { }}
              editable={false}
            />
          </>
        )}
      </main>

      <ToastContainer />
    </div>
  );
}