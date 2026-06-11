import { NavLink } from "react-router";
import { useSesionStore } from "../../stores/sesionStore";

import SetsIcon from "../icons/SetsIcon";
import BodyIcon from "../icons/BodyIcon";
import TodayIcon from "../icons/TodayIcon";
import Mancuerna from "../icons/Mancuerna";

const navItems = [
  { path: "/sets", label: "Sets", icon: SetsIcon },
  { path: "/sessions", label: "Sesiones", icon: Mancuerna },
  { path: "/body", label: "Body", icon: BodyIcon },
  { path: "/today", label: "Hoy", icon: TodayIcon },
];

export default function TabBar() {
  const { isStarted } = useSesionStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-[#443737] border-t border-white/5">
      <div className="flex items-center justify-around w-full max-w-md px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSessionsTab = item.path === "/sessions";
          const isActiveSession = isSessionsTab && isStarted;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                w-20 flex flex-col items-center justify-center
                gap-1.5 py-2 rounded-2xl
                transition-all duration-200
                ${
                  isActiveSession
                    ? "bg-[#2f402f] text-green-500"
                    : isActive
                    ? "bg-[#573931] text-karga-orange"
                    : "text-zinc-500"
                }
              `}
            >
              <Icon />
              <span className="text-[11px] font-medium tracking-wide">
                {isActiveSession ? "Activo" : item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}