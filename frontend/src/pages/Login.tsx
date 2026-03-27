import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/Login.css';
import logo from '../assets/wallemrectangle.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Footer } from '../components/Footer';
// import { ROLES } from '../utils/roleUtils';

// interface StaticUser {
//     role?: string;
//     roles?: string[];
//     email: string;
//     password: string;
//     name: string;
// }

// // Static users for demo purposes
// export const STATIC_USERS: StaticUser[] = [
//     {
//         role: ROLES.APPROVER,
//         email: "approver@demo.com",
//         password: "admin123",
//         name: "Jane Doe"
//     },
//     {
//         role: ROLES.DEPUTY,
//         email: "deputy@demo.com",
//         password: "admin123",  
//         name: "John Smith"
//     },
//     {
//         role: ROLES.DAM_WPSI,
//         email: "damwpsi@demo.com",
//         password: "admin123",
//         name: "Alice Johnson"
//     },
//     {
//         role: ROLES.DAM_WMSI,
//         email: "damwmsi@demo.com",
//         password: "admin123",
//         name: "Bob Williams"
//     },
//     {
//         role: ROLES.DAM_WLPI,
//         email: "damwlpi@demo.com",
//         password: "admin123",
//         name: "Charlie Brown"
//     },
//     {
//         role: ROLES.DAM_CFII,
//         email: "damcfii@demo.com",
//         password: "admin123",
//         name: "David Davis"
//     },
//     {
//         roles: [ROLES.DAM_WPSI, ROLES.DAM_WMSI],
//         email: "dammulticompany@demo.com",
//         password: "admin123",
//         name: "Morgan Lee"
//     },
//     {
//         role: ROLES.WORKER,
//         email: "worker@demo.com",
//         password: "admin123",
//         name: "Eve Miller"
//     }
// ];



interface LoginFormData {
    email: string
    password: string
}

interface LoginErrors {
    email?: string
    password?: string
    general?: string
}

function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    })
    const [errors, setErrors] = useState<LoginErrors>({})
    const [isLoading, setIsLoading] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [infoMessage, setInfoMessage] = useState<string>('')

    useEffect(() => {
        if (location.state?.message) {
            setInfoMessage(location.state.message)
            const timer = setTimeout(() => setInfoMessage(''), 10000)
            return () => clearTimeout(timer)
        }
    }, [location])

    const validateForm = (): boolean => {
        const newErrors: LoginErrors = {}

        // Email regex validation
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        // Check if user exists in STATIC_USERS
        const user = STATIC_USERS.find(
            u => u.email === formData.email && u.password === formData.password
        );
        if (formData.email && formData.password && !user) {
            newErrors.general = 'Invalid email or password';
        }

        setErrors(newErrors)

        // Trigger Toast for the first error found
        const firstError = Object.values(newErrors)[0]
        if (firstError) {
            toast.error(firstError)
            return false
        }

        return true
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        if (errors[name as keyof LoginErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }))
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        setTimeout(() => {
            try {
                const user = STATIC_USERS.find(
                    u => u.email === formData.email && u.password === formData.password
                );
                if (user) {
                    const persistedRole = user.roles?.length ? JSON.stringify(user.roles) : (user.role || '');

                    // AuthToken placed in localStorage for demo purposes
                    localStorage.setItem('authToken', 'demo-token-' + Date.now());
                    localStorage.setItem('userEmail', user.email);
                    localStorage.setItem('userRole', persistedRole);
                    localStorage.setItem('userName', user.name);

                    const toastId = toast.success("Login successful! Redirecting...");

                    setTimeout(() => {
                        toast.dismiss(toastId); // Dismiss the toast before navigating
                        navigate('/dashboard');
                    }, 1000);
                } else {
                    toast.error("Invalid email or password");
                    setIsLoading(false);
                }
            } catch (error) {
                toast.error("An unexpected error occurred");
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1 className="text-2xl font-semibold">
                        <img src={logo} alt="Wallem Logo" className="w-8 h-8" />
                    </h1>
                    <p>Sign in to your account</p>
                </div>
                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {infoMessage && (
                        <div className="info-message" style={{
                            padding: '12px',
                            marginBottom: '16px',
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            borderRadius: '8px',
                            border: '1px solid #90caf9',
                            fontSize: '14px'
                        }}>
                            {infoMessage}
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="text-[16px]"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={isPasswordVisible ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="text-[16px]"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                disabled={isLoading}
                                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                            >
                                {isPasswordVisible ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.5-7.5a10.05 10.05 0 012.563-4.568m3.11-2.14A9.956 9.956 0 0112 5c5 0 9.27 3.11 10.5 7.5a9.956 9.956 0 01-4.198 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.857-.67 1.673-1.176 2.414M15.5 15.5a5.978 5.978 0 01-3.5 1c-3.314 0-6-2.686-6-6" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <Footer />
            </div>
        </div>
    )
}

export default Login
