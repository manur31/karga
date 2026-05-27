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
import { useLogin } from "../hooks/mutations/useAuthMutations";
import { useForm } from "react-hook-form";
import { loginSchema } from "../lib/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "all",
  });

  const { mutate: login, isPending, isSuccess, error } = useLogin();

  const onSubmit = (data) => {
    console.log(data);

    login(data);

    if (isSuccess) {
      navigate("/sets");
    }
  };

  const handleGoogleLogin = () => {
    // reemplazar al auth con google
    setTimeout(() => {
      navigate("/onboarding");
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto px-4 py-8 mt-4">
      {/* LOGO */}
      <div className="flex flex-col items-center mb-13 text-center">
        <Mancuerna className="w-16 h-16 text-karga-orange mb-4" />
        <h1 className="text-7xl font-black tracking-tight text-karga-lightorange drop-shadow-[0_0_16px_rgba(255,168,130,0.1)]">
          Karga
        </h1>
        <p className="text-sm text-zinc-400 mt-3 font-medium">
          Tu entrenamiento, tu fuerza
        </p>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* input de email */}
        <Input
          type="email"
          placeholder="Email"
          disabled={isPending}
          required
          {...register("email")}
        />
        {error?.email && (
          <p className="text-red-500 text-sm">{error.email.message}</p>
        )}
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}

        {/* input de contraseña */}
        <div className="relative flex items-center">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            disabled={isPending}
            required
            className="pr-12"
            {...register("password")}
          />
          {error?.password && (
            <p className="text-red-500 text-sm">{error.password.message}</p>
          )}
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {/* el toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </div>

        {/* botón login*/}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className={`mt-2 ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isPending ? "Iniciando..." : "Iniciar sesión"}
        </Button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="h-px bg-white/5 flex-1" />
        <span className="text-zinc-500 text-sm font-medium">
          o continuar con
        </span>
        <div className="h-px bg-white/5 flex-1" />
      </div>

      {/* botón  Google */}
      <Button
        type="button"
        variant="secondary"
        size="lg"
        disabled={isPending}
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/5 hover:bg-white/10"
      >
        <GoogleIcon />
        <span className="font-bold text-zinc-200">Google</span>
      </Button>

      {/* registrarse */}
      <div className="mt-auto pt-8 text-center text-sm font-medium text-zinc-400">
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          disabled={isPending}
          className="text-karga-orange hover:text-karga-lightorange transition-colors font-bold"
        >
          Regístrate
        </button>
      </div>
    </div>
  );
}
