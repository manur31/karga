import { useAuth } from "../hooks/queries/useAuth";
import { useEffect } from "react";
import { getExercises } from "../service/exersiseService";

function SetsPage() {
  const { data: profile, isLoading } = useAuth();
  const { logout } = useAuth();
  //testing unicamente de los exersises
  useEffect(() => {
    getExercises()
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  if (isLoading) return <div>Loading...</div>;

  console.log(profile)
  
  return (
    <div>
      <h1>Hola {profile?.name}</h1>
      <button
        onClick={logout}
        className="border-2 rounded-2xl border-karga-orange px-4 py-2 text-karga-orange hover:bg-karga-orange hover:text-white transition-colors cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
}

export default SetsPage;
