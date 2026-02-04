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
    ArrowLeftRight
} from 'lucide-react';
import logo from '../../assets/logo.jpeg';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { role: 'super_admin' };
    const role = user.role;

    const allMenuItems = {
        super_admin: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'Manage Admins', icon: <Settings size={20} />, path: '/manage-admins' },
            { name: 'Add Quantity', icon: <PlusCircle size={20} />, path: '/add-quantity' },
            { name: 'Global Stock', icon: <PackagePlus size={20} />, path: '/product-quantity' },
            { name: 'Transfer Stock', icon: <ArrowLeftRight size={20} />, path: '/product-assign' },
            { name: 'Kitchen Fleet', icon: <ChefHat size={20} />, path: '/kitchen-management' },
            { name: 'Reports', icon: <TrendingUp size={20} />, path: '/reports' },
        ],
        billing_admin: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'Assign Orders', icon: <Receipt size={20} />, path: '/add-billing' },
            { name: 'Billing Records', icon: <Settings size={20} />, path: '/billing-management' },
            { name: 'My Inventory', icon: <Boxes size={20} />, path: '/my-inventory' },
            { name: 'Transfer to Kitchen', icon: <ArrowLeftRight size={20} />, path: '/product-assign' },
            { name: 'Stock History', icon: <CalendarDays size={20} />, path: '/day-stock' },
            { name: 'Reports', icon: <TrendingUp size={20} />, path: '/reports' },
        ],
        kitchen_admin: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'Kitchen Orders', icon: <ChefHat size={20} />, path: '/kitchen-orders' },
            { name: 'My Stock', icon: <Boxes size={20} />, path: '/my-inventory' },
            { name: 'Stock Log', icon: <CalendarDays size={20} />, path: '/day-stock' },
            { name: 'Order History', icon: <Receipt size={20} />, path: '/billing-management' },
            { name: 'Reports', icon: <TrendingUp size={20} />, path: '/reports' },
        ]
    };

    const commonItems = [
        { name: 'Change Password', icon: <KeyRound size={20} />, path: '/change-password' },
    ];

    const menuItems = [...(allMenuItems[role] || allMenuItems.super_admin), ...commonItems];

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
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
                <div className="flex-1 overflow-y-auto px-3 space-y-2 py-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary text-secondary font-semibold shadow-lg shadow-primary/20'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <div className="shrink-0">{item.icon}</div>
                            {isOpen && <span className="text-sm font-medium">{item.name}</span>}
                            {!isOpen && (
                                <div className="absolute left-20 bg-secondary text-white px-3 py-1.5 rounded-lg text-sm invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100] border border-white/10">
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
