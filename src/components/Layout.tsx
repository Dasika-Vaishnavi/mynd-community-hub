import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Brain, Users, User, Bell, PenSquare, TrendingUp, Sparkles, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { MyndPet } from "./MyndPet";
import { MyndPetWidget } from "./MyndPetWidget";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/therapy", label: "Therapy", icon: Brain },
  { path: "/community", label: "Community", icon: Users },
  { path: "/profile", label: "Profile", icon: User },
];

const TRENDING_SPACES = [
  { name: "UnwindYourMynd", members: "12.4k" },
  { name: "ADHDWarriors", members: "8.9k" },
  { name: "AnxietySupport", members: "15.2k" },
  { name: "MindfulMoments", members: "6.7k" },
  { name: "TherapyTalks", members: "4.3k" },
];

export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { user, isConfigured, signOut } = useAuth();
  const isAuthRoute = location.pathname === "/auth";

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  };

  if (isAuthRoute) {
    return <main className="min-h-screen bg-background noise-overlay relative z-10">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background noise-overlay">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-card border-r border-border z-30">
        <div className="p-5 flex items-center gap-3">
          <MyndPet size={40} color="hsl(252, 75%, 60%)" expression="excited" />
          <h1 className="font-display font-black text-2xl text-foreground">Mynd</h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-display font-semibold text-sm transition-colors ${
                  active
                    ? "gradient-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mb-3">
          <button className="w-full flex items-center justify-center gap-2 gradient-primary text-primary-foreground rounded-xl py-3 font-display font-bold text-sm shadow-soft hover:opacity-90 transition-opacity">
            <PenSquare size={18} />
            Create Post
          </button>
        </div>

        <div className="px-3 mb-3">
          {isConfigured && user ? (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-display font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-display font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              <LogIn size={16} />
              Sign in
            </Link>
          )}
        </div>

        {/* Mynd Pet Widget */}
        <div className="px-3 mb-3">
          <MyndPetWidget
            karma={2340}
            petColor="hsl(329, 86%, 70%)"
            petExpression="happy"
            myndAge="4 months"
            username="MindfulMango"
          />
        </div>

        {/* Trending */}
        <div className="px-4 pb-5 border-t border-border pt-4">
          <h3 className="font-display font-bold text-xs uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} />
            Trending Spaces
          </h3>
          <div className="space-y-2">
            {TRENDING_SPACES.map((s) => (
              <Link
                key={s.name}
                to={`/space/${encodeURIComponent(s.name)}`}
                className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-sm font-medium text-foreground">m/{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.members}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Top bar mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-lg border-b border-border z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <MyndPet size={28} color="hsl(252, 75%, 60%)" expression="excited" />
          <h1 className="font-display font-black text-xl text-foreground">Mynd</h1>
        </div>
        <div className="flex items-center gap-2">
          {isConfigured && user ? (
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Sign out"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <Link
              to="/auth"
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Sign in"
            >
              <LogIn size={20} />
            </Link>
          )}
          <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <Sparkles size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0 relative z-10">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border z-30 flex items-center justify-around py-2 px-4">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px]"
            >
              <motion.div
                animate={active ? { scale: 1.15 } : { scale: 1 }}
                className={active ? "text-primary" : "text-muted-foreground"}
              >
                <Icon size={22} />
              </motion.div>
              <span className={`text-[10px] font-display font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
