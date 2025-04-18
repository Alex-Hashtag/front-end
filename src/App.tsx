import {Route, Routes} from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import NewsList from './pages/news/NewsList'
import NewsDetail from './pages/news/NewsDetail'
import CreateNews from './pages/news/CreateNews'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import EditNews from './pages/news/EditNews'
import StoreList from "./pages/store/StoreList.tsx";
import CreateProduct from "./pages/store/CreateProduct.tsx";
import ProductDetail from "./pages/store/ProductDetail.tsx";
import Cart from "./pages/store/Cart.tsx";
import Checkout from "./pages/store/Checkout.tsx";
import {CartProvider} from "./context/CartContext.tsx";
import OrderConfirmation from "./pages/store/OrderConfirmation.tsx";
import EditProduct from "./pages/store/EditProduct.tsx";
import Profile from "./pages/profile/Profile.tsx";
import MyOrders from "./pages/profile/MyOrders.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import ProtectedRoute from "./components/common/ProtectedRouteProps.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminUserDetail from "./pages/admin/AdminUserDetail.tsx";
import AdminBalance from "./pages/admin/AdminBalance.tsx";
import NotFound from "./pages/infrastructure/NotFound.tsx";
import ErrorPage from "./pages/infrastructure/ErrorPage.tsx";
import Forbidden from "./pages/infrastructure/Forbidden.tsx";
import Maintenance from "./pages/infrastructure/Maintenance.tsx";
import ErrorBoundary from "./components/common/ErrorBoundary.tsx";
import './styles/markdown.css'
import './styles/infrastructure.css'
import './styles/transitions.css'
import { ThemeProvider } from './context/ThemeContext.tsx'

export function App()
{
    return (
        <ThemeProvider>
            <ErrorBoundary>
                <Navbar/>
                <CartProvider>
                    <Routes>
                        <Route path="/" element={<Home/>}/>

                        {/* Auth */}
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/verify" element={<VerifyEmail/>}/>
                        <Route path="/forgot-password" element={<ForgotPassword/>}/>
                        <Route path="/reset-password" element={<ResetPassword/>}/>

                        {/* News */}
                        <Route path="/news" element={<NewsList/>}/>
                        <Route path="/news/create" element={<CreateNews/>}/>
                        <Route path="/news/:id" element={<NewsDetail/>}/>
                        <Route path="/news/edit/:id" element={<EditNews/>}/>

                        {/* Store */}
                        <Route path="/store" element={<StoreList/>}/>
                        <Route path="/store/create" element={<CreateProduct/>}/>
                        <Route path="/store/:id" element={<ProductDetail/>}/>
                        <Route path="/store/edit/:id" element={<EditProduct/>}/>
                        <Route path="/store/cart" element={<Cart/>}/>
                        <Route path="/store/checkout" element={<Checkout/>}/>
                        <Route path="/store/order-confirmation" element={<OrderConfirmation/>}/>

                        {/* Profile */}
                        <Route path="/profile" element={<Profile/>}/>
                        <Route path="/profile/orders" element={<MyOrders/>}/>

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute requiredRole={1}>
                                <AdminDashboard/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/admin/users" element={
                            <ProtectedRoute requiredRole={1}>
                                <AdminUsers/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/admin/users/:id" element={
                            <ProtectedRoute requiredRole={1}>
                                <AdminUserDetail/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/admin/balance" element={
                            <ProtectedRoute requiredRole={2}>
                                <AdminBalance/>
                            </ProtectedRoute>
                        }/>
                        
                        {/* Infrastructure Pages */}
                        <Route path="/error" element={<ErrorPage />} />
                        <Route path="/forbidden" element={<Forbidden />} />
                        <Route path="/maintenance" element={<Maintenance />} />
                        
                        {/* 404 - This must be the last route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </CartProvider>
                <Footer/>
            </ErrorBoundary>
        </ThemeProvider>
    )
}