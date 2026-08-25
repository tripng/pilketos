import Footer from '@/Components/Footer';

export default function AppLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-emerald-50">
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
