import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import FarmhouseDetail from './pages/FarmhouseDetail';
import NotFound from './pages/NotFound';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AddFarmhouse from './pages/admin/AddFarmhouse';
import EditFarmhouse from './pages/admin/EditFarmhouse';
import BookingLeads from './pages/admin/BookingLeads';
import ManageReviews from './pages/admin/ManageReviews';
import BulkUploadFarmhouse from './pages/admin/BulkUploadFarmhouse';
import useLanguage from './hooks/useLanguage';

// ─── Scroll to top on every route change ───
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

// ─── Dynamic <html lang> based on selected language ───
const DynamicLang = () => {
    const { language } = useLanguage();

    const langMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        gu: 'gu-IN',
    };

    const currentLang = langMap[language] || 'en-IN';

    return (
        <Helmet>
            <html lang={currentLang} />
        </Helmet>
    );
};

function App() {
    return (
        <>
            <DynamicLang />
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 pb-1 md:pb-0">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/farmhouses" element={<SearchResults />} />
                        <Route path="/farmhouse/:slug" element={<FarmhouseDetail />} />
                        <Route path="/admin/login" element={<Login />} />
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute><Dashboard /></ProtectedRoute>
                        } />
                        <Route path="/admin/add-farmhouse" element={
                            <ProtectedRoute><AddFarmhouse /></ProtectedRoute>
                        } />
                        <Route path="/admin/edit-farmhouse/:id" element={
                            <ProtectedRoute><EditFarmhouse /></ProtectedRoute>
                        } />
                        <Route path="/admin/bookings" element={
                            <ProtectedRoute><BookingLeads /></ProtectedRoute>
                        } />
                        <Route path="/admin/reviews" element={
                            <ProtectedRoute><ManageReviews /></ProtectedRoute>
                        } />
                        <Route path="/admin/bulk-upload" element={
                            <ProtectedRoute><BulkUploadFarmhouse /></ProtectedRoute>
                        } />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </>
    );
}

export default App;