import { Link } from "react-router";
import { useAuth } from "../hooks/queries/useAuth";
import Button from "../components/Button/Button";

export default function NotFound() {
  const { data: profile } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-7xl font-bold text-karga-orange">
          <div className="flex items-center gap-1">
            4
            <span className="text-karga-orange/50">0</span>
            <div className="text-karga-orange rotate-10 translate-y-1">4</div>
          </div>
        </p>
        <h2 className="text-2xl text-zinc-400">Página no encontrada</h2>
      </div>

      <Link to={profile ? "/rutinas" : "/login"}>
        <Button variant="primary" size="lg">
          {profile ? "Ir a Rutinas" : "Iniciar Sesión"}
        </Button>
      </Link>

      <div className="fixed bottom-10">
        <img src="./karga-logo-light.webp" alt="Karga Logo" className="w-16" />
      </div>
    </div>
  );
}
