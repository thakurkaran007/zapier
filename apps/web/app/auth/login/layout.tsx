const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="antialiased bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 to-amber-800 min-h-screen">
            {children}
        </div>
    );
};

export default AuthLayout;