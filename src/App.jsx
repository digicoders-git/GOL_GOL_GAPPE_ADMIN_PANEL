import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const UserLogin = lazy(() => import('./pages/UserLogin'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderMenu = lazy(() => import('./pages/OrderMenu'));
const AddQuantity = lazy(() => import('./pages/AddQuantity'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const AddBilling = lazy(() => import('./pages/AddBilling'));
const ProductQuantity = lazy(() => import('./pages/ProductQuantity'));
const ProductAssign = lazy(() => import('./pages/ProductAssign'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BillingManagement = lazy(() => import('./pages/BillingManagement'));
const AddKitchen = lazy(() => import('./pages/AddKitchen'));
const KitchenManagement = lazy(() => import('./pages/KitchenManagement'));
const DayWiseStock = lazy(() => import('./pages/DayWiseStock'));
const MonthWiseStock = lazy(() => import('./pages/MonthWiseStock'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const ManageAdmins = lazy(() => import('./pages/ManageAdmins'));
const MyInventory = lazy(() => import('./pages/MyInventory'));
const KitchenOrders = lazy(() => import('./pages/KitchenOrders'));
const Reports = lazy(() => import('./pages/Reports'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const UsersManagement = lazy(() => import('./pages/UsersManagement'));
const OrdersTracking = lazy(() => import('./pages/OrdersTracking'));
const BillingAdminDashboard = lazy(() => import('./pages/BillingAdminDashboard'));
const KitchenAdminDashboard = lazy(() => import('./pages/KitchenAdminDashboard'));
const KitchenStockMonitor = lazy(() => import('./pages/KitchenStockMonitor'));

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/user-login" element={<UserLogin />} />

          <Route path="/" element={
            <ProtectedRoute allowedRoles={['super_admin', 'billing_admin', 'kitchen_admin', 'admin', 'user']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* User Specific Routes */}
            <Route path="user-dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
            <Route path="order-menu" element={<ProtectedRoute allowedRoles={['user']}><OrderMenu /></ProtectedRoute>} />
            <Route path="product/:id" element={<ProtectedRoute allowedRoles={['user']}><ProductDetail /></ProtectedRoute>} />
            <Route path="user-orders" element={<ProtectedRoute allowedRoles={['user']}><MyOrders /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfile /></ProtectedRoute>} />

            {/* Admin/Staff Specific Routes */}
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['super_admin', 'billing_admin', 'kitchen_admin', 'admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="billing-dashboard" element={<ProtectedRoute allowedRoles={['billing_admin']}><BillingAdminDashboard /></ProtectedRoute>} />
            <Route path="kitchen-dashboard" element={<ProtectedRoute allowedRoles={['kitchen_admin']}><KitchenAdminDashboard /></ProtectedRoute>} />
            <Route path="add-product" element={<ProtectedRoute allowedRoles={['super_admin']}><AddProduct /></ProtectedRoute>} />
            <Route path="add-quantity" element={<ProtectedRoute allowedRoles={['super_admin']}><AddQuantity /></ProtectedRoute>} />
            <Route path="product-quantity" element={<ProtectedRoute allowedRoles={['super_admin']}><ProductQuantity /></ProtectedRoute>} />
            <Route path="manage-admins" element={<ProtectedRoute allowedRoles={['super_admin']}><ManageAdmins /></ProtectedRoute>} />
            <Route path="add-kitchen" element={<ProtectedRoute allowedRoles={['super_admin']}><AddKitchen /></ProtectedRoute>} />
            <Route path="kitchen-management" element={<ProtectedRoute allowedRoles={['super_admin']}><KitchenManagement /></ProtectedRoute>} />
            <Route path="kitchen-stock-monitor" element={<ProtectedRoute allowedRoles={['super_admin']}><KitchenStockMonitor /></ProtectedRoute>} />

            <Route path="order-assign" element={<ProtectedRoute allowedRoles={['super_admin', 'billing_admin']}><AddBilling /></ProtectedRoute>} />
            <Route path="product-assign" element={<ProtectedRoute allowedRoles={['super_admin', 'billing_admin']}><ProductAssign /></ProtectedRoute>} />

            <Route path="my-inventory" element={<ProtectedRoute allowedRoles={['billing_admin', 'kitchen_admin']}><MyInventory /></ProtectedRoute>} />
            <Route path="kitchen-orders" element={<ProtectedRoute allowedRoles={['kitchen_admin']}><KitchenOrders /></ProtectedRoute>} />

            <Route path="billing-management" element={<BillingManagement />} />
            <Route path="day-stock" element={<DayWiseStock />} />
            <Route path="month-stock" element={<MonthWiseStock />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><UsersManagement /></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><OrdersTracking /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/user-login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
