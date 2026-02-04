import { Menu, User, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (
        <nav className={`fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-primary/10 transition-all duration-300 z-40 flex items-center justify-between px-6 ${isOpen ? 'left-72' : 'left-20'
            }`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2.5 rounded-xl hover:bg-primary/10 text-secondary transition-colors"
                >
                    <Menu size={24} />
                </button>
                <h2 className="text-lg font-semibold text-secondary hidden md:block">
                    Dashboard Overview
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2.5 rounded-xl hover:bg-primary/10 text-secondary transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-primary/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-secondary">{user.email || 'Admin'}</p>
                        <p className="text-xs text-secondary/60">{user.role || 'admin'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                        <User size={20} />
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-2.5 rounded-xl hover:bg-red-100 text-red-600 transition-colors ml-2"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
