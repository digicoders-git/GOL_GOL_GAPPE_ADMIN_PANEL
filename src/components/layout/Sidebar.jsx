import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusCircle,
    Settings,
    Receipt,
    ChefHat,
    Boxes,
    TrendingUp,
    CalendarDays,
    KeyRound,
    LogOut,
    PackagePlus,
    ArrowLeftRight,
    UtensilsCrossed,
    Users,
    ShoppingCart,
    Activity
} from 'lucide-react';
import { FaHome, FaUtensils, FaHistory, FaUser } from 'react-icons/fa';
import logo from '../../assets/logo.jpeg';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { role: 'super_admin' };
    const rawRole = user.role;
    // Map 'admin' to 'super_admin' for menu consistency
    const role = rawRole === 'admin' ? 'super_admin' : rawRole;

    const allMenuItems = {
        super_admin: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'Manage Admins', icon: <Settings size={20} />, path: '/manage-admins' },
            { name: 'Add Product', icon: <PackagePlus size={20} />, path: '/add-product' },
            { name: 'Add Quantity', icon: <PlusCircle size={20} />, path: '/add-quantity' },
            { name: 'Add Kitchen', icon: <UtensilsCrossed size={20} />, path: '/add-kitchen' },
            { name: 'Manage Kitchen', icon: <ChefHat size={20} />, path: '/kitchen-management' },
            { name: 'Kitchen Monitor', icon: <Activity size={20} />, path: '/kitchen-stock-monitor' },
            { name: 'Global Stock', icon: <Boxes size={20} />, path: '/product-quantity' },
            { name: 'Transfer Stock', icon: <ArrowLeftRight size={20} />, path: '/product-assign' },
            { name: 'All Customers', icon: <Users size={20} />, path: '/users' },
            { name: 'Orders Tracking', icon: <ShoppingCart size={20} />, path: '/orders' },
            
            
            { name: 'Reports', icon: <TrendingUp size={20} />, path: '/reports' },
        ],
        billing_admin: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'Assign Orders', icon: <Receipt size={20} />, path: '/order-assign' },
            { name: 'Billing Records', icon: <Settings size={20} />, path: '/billing-management' },
            { name: 'My Inventory', icon: <Boxes size={20} />, path: '/my-inventory' },
            { name: 'Stock History', icon: <CalendarDays size={20} />, path: '/day-stock' },
            { name: 'Reports', icon: <TrendingUp size={20} />, path: '/reports' },
        ],
        kitchen_admin: [
            { name: 'My Kitchen', icon: <LayoutDashboard size={20} />, path: '/kitchen-dashboard' },
            { name: 'Kitchen Orders', icon: <ChefHat size={20} />, path: '/kitchen-orders' },
            { name: 'My Stock', icon: <Boxes size={20} />, path: '/my-inventory' },
            { name: 'Stock Log', icon: <CalendarDays size={20} />, path: '/day-stock' },
            { name: 'Order History', icon: <Receipt size={20} />, path: '/billing-management' },
            { name: 'Reports', icon: <TrendingUp size={20} />, path: '/reports' },
        ],
        user: [
            { name: 'Home', icon: <FaHome size={20} />, path: '/user-dashboard' },
            { name: 'Order Menu', icon: <FaUtensils size={20} />, path: '/order-menu' },
            { name: 'My Orders', icon: <FaHistory size={20} />, path: '/user-orders' },
            { name: 'Profile', icon: <FaUser size={20} />, path: '/profile' },
        ]
    };

    const commonItems = [
        { name: 'Change Password', icon: <KeyRound size={20} />, path: '/change-password' },
    ];

    const menuItems = [...(allMenuItems[role] || allMenuItems.super_admin), ...commonItems];

    const navigate = useNavigate();

    const handleLogout = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const redirectPath = user.role === 'user' ? '/user-login' : '/login';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate(redirectPath);
    };

    return (
        <aside
            className={`fixed top-0 left-0 h-full bg-secondary text-white transition-all duration-300 z-50 ${isOpen ? 'w-72' : 'w-20'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="p-4 flex items-center gap-3 border-b border-white/10 mb-6">
                    <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg shrink-0" />
                    {isOpen && (
                        <span className="font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden">
                            Gol Gol Gappe
                        </span>
                    )}
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3 space-y-3 py-4">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 group relative ${isActive && (item.name !== 'Order Menu' || !window.location.hash)
                                    ? 'bg-primary text-secondary font-black shadow-lg shadow-primary/20 scale-[1.02]'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <div className="shrink-0">{item.icon}</div>
                            {isOpen && <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>}
                            {!isOpen && (
                                <div className="absolute left-20 bg-secondary text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100] border border-white/10">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Logout Button */}
                <div className="p-4 mt-auto border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-colors group relative">
                        <LogOut size={20} />
                        {isOpen && <span className="text-sm font-medium">Logout</span>}
                        {!isOpen && (
                            <div className="absolute left-20 bg-red-400 text-white px-3 py-1.5 rounded-lg text-sm invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100]">
                                Logout
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
