import {Route, Routes} from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import NewsList from './pages/news/NewsList'
import NewsDetail from './pages/news/NewsDetail'
import CreateNews from './pages/news/CreateNews'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import VerifyEmail from './pages/auth/VerifyEmail'
import EditNews from './pages/news/EditNews'
import './styles/old/news.css'
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

export function App()
{
    return (
        <>
            <Navbar/>
            <CartProvider><Routes>
                <Route path="/" element={<Home/>}/>

                {/* Auth */}
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/verify" element={<VerifyEmail/>}/>

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
                    <ProtectedRoute requiredRole={2}>
                        <AdminDashboard/>
                    </ProtectedRoute>
                }/>
                <Route path="/admin/users" element={
                    <ProtectedRoute requiredRole={2}>
                        <AdminUsers/>
                    </ProtectedRoute>
                }/>
                <Route path="/admin/users/:id" element={
                    <ProtectedRoute requiredRole={2}>
                        <AdminUserDetail/>
                    </ProtectedRoute>
                }/>
                <Route path="/admin/balance" element={
                    <ProtectedRoute requiredRole={2}>
                        <AdminBalance/>
                    </ProtectedRoute>
                }/>
            </Routes></CartProvider>

        </>
    )
}