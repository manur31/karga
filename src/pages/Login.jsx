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
    mode: "onTouched",
  });

  const { mutate: login, isPending } = useLogin();

  const onSubmit = (data) => {
    login(data, {
      onSuccess: () => {
        navigate("/sets"); // Solo pasa si la contraseña y mail son correctos en la BD
      }
    });
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
        <p className="text-sm text-zinc-400 mt-5 font-medium">
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
            {...register("email")}
            className="
            hover:placeholder:text-karga-lightorange
            focus:placeholder:text-karga-lightorange
            hover:drop-shadow-[0_0_0.67px_var(--color-karga-lightorange)]
            focus:drop-shadow-[0_0_0.67px_var(--color-karga-lightorange)]
            transition-all
            duration-300
            glowy-placeholder
            "
        />
        {errors.email && (
            <span className="text-red-500 text-xs pl-3 font-semibold mt-0.5">
              {errors.email.message}
            </span>
          )}

        <div className="flex flex-col gap-2 w-full">
        
        <div className="relative flex items-center w-full">
            <Input 
            type={showPassword ? "text" : "password"} 
            placeholder="Contraseña" 
            disabled={isPending}
            {...register("password")}
            required
            className="pr-12 w-full 
            hover:placeholder:text-karga-lightorange
            focus:placeholder:text-karga-lightorange
            hover:drop-shadow-[0_0_0.67px_var(--color-karga-lightorange)]
            focus:drop-shadow-[0_0_0.67px_var(--color-karga-lightorange)]
            transition-all
            duration-300
            glowy-placeholder
            "
            />
            
            <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            className="absolute right-4 text-zinc-500 hover:text-karga-lightorange transition-colors focus:outline-none"
            >
            {showPassword ? <EyeIcon/> : <EyeOffIcon/>}
            </button>
        </div>

        {errors.password && (
            <span className="text-red-500 text-xs pl-3 font-semibold">
              {errors.password.message}
            </span>
          )}

        <button
            type="button"
            disabled={isPending}
            onClick={() => navigate('/forgot-password')} // hay q crear la ruta y manejarlo
            className="self-end mr-3 pt-0.75 pb-1 text-xs text-karga-lightorange/80 hover:text-karga-lightorange font-medium tracking-wide transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none hover:drop-shadow-[0_0_0.67px_var(--color-karga-lightorange)]"
        >
            ¿Olvidaste tu contraseña?
        </button>

        </div>

        {/* botón login*/}
        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          disabled={isPending}
          className={`
            mt-2
            relative
            overflow-hidden
            transition-all
            duration-300

            before:absolute
            before:inset-0
            before:bg-karga-lightorange/0
            before:transition-all
            before:duration-300
            hover:before:bg-karga-lightorange/35
            hover:drop-shadow-[0_0_1px_var(--color-karga-lightorange)]
            hover:shadow-karga-lightorange/10
          
            ${isPending ? 'opacity-70 cursor-not-allowed' : ''}
          `}
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
