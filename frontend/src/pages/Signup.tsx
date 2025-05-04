import { useState, ChangeEvent } from "react";
import { SignupInput } from "@gopiyadav989/unpolished";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "../components/ui/Spinner";

const SignupPage = () => {
  const [formData, setFormData] = useState<SignupInput>({
    name: "",
    email: "",
    password: "",
    username: ""
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }

  const navigate = useNavigate();

  async function handleSubmit() {
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/auth/signup`, formData);
      const token = res.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem('userId', res.data.user.id);
      localStorage.setItem('username', res.data.user.username);
      localStorage.setItem('profileImage', res.data.user.profileImage);
      navigate("/");
    }
    catch (e) {
      alert("Error while signing up");
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-serif">
      <div className="w-full max-w-3xl flex overflow-hidden rounded-2xl shadow-xl">
        {/* Left Panel */}
        <div className="w-2/5 bg-black text-white p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-1">U.</h1>
            <div className="h-px w-8 bg-gray-500 my-3"></div>
            <p className="text-xs uppercase tracking-widest text-gray-400">Unpolished</p>
          </div>
          
          {/* <div className="space-y-4">
            <p className="text-sm font-light italic">
            "The more that you read, the more things you will know. The more that you learn, the more places you'll go."
            </p>
            <p className="text-xs text-gray-400">— Dr. Seuss</p>
          </div> */}
        </div>
        
        {/* Right Panel */}
        <div className="w-3/5 bg-white p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Create Account</h2>
            <p className="text-gray-500 text-sm">Join our exclusive community</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-black text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-black text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-black text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-black text-sm"
              />
            </div>
            
            <button
              onClick={handleSubmit}
              className="w-full py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors flex items-center justify-center"
            >
              {!loading ? 'Register' : <> <Spinner /> <span className="ml-2">Processing...</span> </>}
            </button>
            
            {/* <div className="flex items-center text-xs text-gray-500 my-2">
              <hr className="flex-grow border-gray-200" />
              <span className="px-2">or</span>
              <hr className="flex-grow border-gray-200" />
            </div>
            
            <button 
              type="button" 
              className="w-full py-2 border border-gray-300 text-sm rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button> */}
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Already have an account? <Link to="/signin" className="text-black font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;