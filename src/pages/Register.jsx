import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";
import {
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
} from "../components/icons";
import { useForm } from "react-hook-form";
import { useRegister } from "../hooks/mutations/useAuthMutations";
import { registerSchema } from "../lib/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  }); 

  const { mutate: registerUser, isPending } = useRegister();

  const onSubmit = (data) => {
    const formData = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    registerUser(formData, {
      onSuccess: () => {
        reset(); 
        navigate("/onboarding"); 
      },
    });
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
      {/* LOGO */}
      <div className="flex flex-col items-center mb-10 text-center">
        <img src="/karga-logo-light.webp" className="w-12 h-12 object-contain mb-2" alt="Karga Logo" />
        <h1 className="text-7xl font-black tracking-tight text-karga-lightorange drop-shadow-[0_0_16px_rgba(255,168,130,0.1)]">
          Karga
        </h1>
        <p className="text-sm text-zinc-400 mt-3 font-medium">
          Tu entrenamiento, tu fuerza
        </p>
      </div>

      {/* FORM DE REGISTRO */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        
        {/* INPUT  NOMBRE */}
        <div className="flex flex-col gap-1 w-full">
          <Input
            type="text"
            placeholder="Nombre"
            disabled={isPending}
            {...register("name")}
          />
          {errors.name && (
            <span className="text-red-500 text-xs pl-3 font-semibold mt-0.5">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* INPUT  EMAIL */}
        <div className="flex flex-col gap-1 w-full">
          <Input 
            type="email" 
            placeholder="Email" 
            disabled={isPending}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500 text-xs pl-3 font-semibold mt-0.5">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* INPUT  CONTRASEÑA */}
        <div className="flex flex-col gap-1 w-full">
          <div className="relative flex items-center">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              disabled={isPending}
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
          {errors.password && (
            <span className="text-red-500 text-xs pl-3 font-semibold mt-0.5">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* INPUT  CONFIRMAR CONTRASEÑA */}
        <div className="flex flex-col gap-1 w-full">
          <div className="relative flex items-center">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              disabled={isPending}
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
          {errors.confirmPassword && (
            <span className="text-red-500 text-xs pl-3 font-semibold mt-0.5">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* BOTÓN ENVIAR */}
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
        <span className="text-zinc-500 text-sm font-medium">o registrarse con</span>
        <div className="h-px bg-white/5 flex-1" />
      </div>

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