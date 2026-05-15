import { NavLink } from "react-router";

const navItems = [
  { path: "/sets", label: "Sets" },
  { path: "/sessions", label: "Sesiones" },
  { path: "/body", label: "Body" },
  { path: "/today", label: "Hoy" },
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#272121] border-t border-white/5 px-2 pb-10 pt-4 z-50">
      <div className="flex justify-between items-center w-full max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center gap-1.5 py-3 mx-1 rounded-2xl transition-all duration-200
              ${isActive ? "bg-[#332A2A] text-karga-orange" : "text-zinc-500"}
            `}
          >
            {/* placeholder */}
            <div className="w-6 h-6 bg-current opacity-20 rounded-md mb-0.5" />

            <span className="text-[10px] font-bold uppercase tracking-wider">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}