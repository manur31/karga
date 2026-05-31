import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";
import {
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  Mancuerna,
} from "../components/icons";
import { useForm } from "react-hook-form";
import { useRegister } from "../hooks/mutations/useAuthMutations";

export default function Register() {
  const navigate = useNavigate();
  // const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { mutate, isPending, isError, error, isSuccess } = useRegister();

  const onSubmit = (data) => {
    // setIsLoading(true);

    //  registro (reemplazar el setTimeout llamada a la API)
    // setTimeout(() => {
    //   setIsLoading(false);
    // }, 500);
    const formData = {
      name: data.name,
      email: data.email,
      password: data.password,
    };
    mutate(formData);
    reset();
    if (isSuccess) {
      navigate("/onboarding");
    }
  };

  // const handleGoogleRegister = () => {
  //   setIsLoading(true);

  //   // registro con Google (reempklazar)
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     navigate("/onboarding");
  //   }, 2000);
  // };

  return (
    <div className="flex flex-col h-full w-full max-w-sm mx-auto px-4 py-2">
      <div className="flex flex-col items-center mb-10 text-center">
        <Mancuerna className="w-12 h-12 text-karga-orange mb-2" />
        <h1 className="text-7xl font-black tracking-tight text-karga-lightorange drop-shadow-[0_0_16px_rgba(255,168,130,0.1)]">
          Karga
        </h1>
        <p className="text-sm text-zinc-400 mt-3 font-medium">
          Tu entrenamiento, tu fuerza
        </p>
      </div>

      {/* FORM DE REGISTRO */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Nombre de Usuario"
          disabled={isPending}
          required
          {...register("name")}
        />

        <Input type="text" placeholder="Nombre" disabled={isPending} required />

        <Input type="email" placeholder="Email" disabled={isPending} required />

        <div className="relative flex items-center">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            disabled={isPending}
            required
            className="pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </div>

        <div className="relative flex items-center">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            disabled={isPending}
            required
            className="pr-12"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isPending}
            className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
          >
            {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </div>

        {/* enviar formulario */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className={`mt-2 ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isPending ? "Creando cuenta..." : "Registrarse"}
        </Button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="h-px bg-white/5 flex-1" />
        <span className="text-zinc-500 text-sm font-medium">
          o registrarse con
        </span>
        <div className="h-px bg-white/5 flex-1" />
      </div>

      {/* google */}
      <Button
        type="button"
        variant="secondary"
        size="lg"
        disabled={isPending}
        onClick={""}
        className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/5 hover:bg-white/10"
      >
        <GoogleIcon />
        <span className="font-bold text-zinc-200">Google</span>
      </Button>

      <div className="mt-auto pt-8 text-center text-sm font-medium text-zinc-400">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={isPending}
          className="text-karga-orange hover:text-karga-lightorange transition-colors font-bold"
        >
          Inicia sesión
        </button>
      </div>
    </div>
  );
}
