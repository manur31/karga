import { NavLink } from "react-router";

const navItems = [
  { path: "/sets", label: "Sets" },
  { path: "/sessions", label: "Sesiones" },
  { path: "/body", label: "Body" },
  { path: "/today", label: "Hoy" },
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#443737] border-t border-white/5 px-4 py-3 z-50">
    <div className="flex items-center justify-around w-full">
        {navItems.map((item) => (
        <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
            w-20 flex flex-col items-center justify-center
            gap-1.5 py-2 rounded-2xl
            transition-all duration-200
            ${
                isActive
                ? "bg-[#573931] text-[#ff4d00]"
                : "text-zinc-500"
            }
            `}
        >
            <div className="w-6 h-6 bg-current rounded-md mb-0.5" />

            <span className="text-[11px] font-medium tracking-wide">
            {item.label}
            </span>
        </NavLink>
        ))}
    </div>
    </nav>
  );
}