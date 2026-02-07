import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const AddQuantity = lazy(() => import('./pages/AddQuantity'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const AddBilling = lazy(() => import('./pages/AddBilling'));
const ProductQuantity = lazy(() => import('./pages/ProductQuantity'));
const ProductAssign = lazy(() => import('./pages/ProductAssign'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Lazy load from OtherPages
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

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add-product" element={<ProtectedRoute allowedRoles={['super_admin']}><AddProduct /></ProtectedRoute>} />
            <Route path="add-quantity" element={<ProtectedRoute allowedRoles={['super_admin']}><AddQuantity /></ProtectedRoute>} />
            <Route path="product-quantity" element={<ProtectedRoute allowedRoles={['super_admin']}><ProductQuantity /></ProtectedRoute>} />
            <Route path="manage-admins" element={<ProtectedRoute allowedRoles={['super_admin']}><ManageAdmins /></ProtectedRoute>} />
            <Route path="add-kitchen" element={<ProtectedRoute allowedRoles={['super_admin']}><AddKitchen /></ProtectedRoute>} />
            <Route path="kitchen-management" element={<ProtectedRoute allowedRoles={['super_admin']}><KitchenManagement /></ProtectedRoute>} />

            <Route path="add-billing" element={<ProtectedRoute allowedRoles={['super_admin', 'billing_admin']}><AddBilling /></ProtectedRoute>} />
            <Route path="product-assign" element={<ProtectedRoute allowedRoles={['super_admin', 'billing_admin']}><ProductAssign /></ProtectedRoute>} />

            <Route path="my-inventory" element={<ProtectedRoute allowedRoles={['billing_admin', 'kitchen_admin']}><MyInventory /></ProtectedRoute>} />
            <Route path="kitchen-orders" element={<ProtectedRoute allowedRoles={['kitchen_admin']}><KitchenOrders /></ProtectedRoute>} />

            <Route path="billing-management" element={<BillingManagement />} />
            <Route path="day-stock" element={<DayWiseStock />} />
            <Route path="month-stock" element={<MonthWiseStock />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
