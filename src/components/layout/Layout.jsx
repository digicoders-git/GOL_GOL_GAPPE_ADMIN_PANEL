import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Loader from '../common/Loader';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className={`transition-all duration-300 min-h-screen ${isSidebarOpen ? 'ml-72' : 'ml-20'
                }`}>
                <Navbar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                <main className="pt-24 p-6">
                    <Suspense fallback={<Loader />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default Layout;
