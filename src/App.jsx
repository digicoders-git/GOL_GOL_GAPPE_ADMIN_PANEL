import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const AddQuantity = lazy(() => import('./pages/AddQuantity'));
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
            <Route path="add-quantity" element={<AddQuantity />} />
            <Route path="product-quantity" element={<ProductQuantity />} />
            <Route path="add-billing" element={<AddBilling />} />
            <Route path="billing-management" element={<BillingManagement />} />
            <Route path="add-kitchen" element={<AddKitchen />} />
            <Route path="kitchen-management" element={<KitchenManagement />} />
            <Route path="product-assign" element={<ProductAssign />} />
            <Route path="day-stock" element={<DayWiseStock />} />
            <Route path="month-stock" element={<MonthWiseStock />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="manage-admins" element={<ManageAdmins />} />
            <Route path="my-inventory" element={<MyInventory />} />
            <Route path="kitchen-orders" element={<KitchenOrders />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
