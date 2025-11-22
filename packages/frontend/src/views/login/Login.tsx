import React from "react";
import Image from "next/image";
import { InlineSpinner } from "@/components/InlineSpinner/InlineSpinner";

export interface LoginViewProps {
  readonly email: string;
  readonly onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  readonly password: string;
  readonly onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  readonly emailError: string | null;
  readonly passwordError: string | null;
  readonly serverError: string | null;

  readonly canSubmit: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  readonly onForgotPasswordClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Login: React.FC<LoginViewProps> = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  emailError,
  passwordError,
  serverError,
  onSubmit,
  canSubmit,
  isSubmitting,
  onForgotPasswordClick,
}) => {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="md:grid md:grid-cols-2">
        {/* Left panel - Login form */}
        <section className="relative min-h-screen md:h-screen flex items-start md:items-center justify-center px-6 py-12 md:py-6">
          <div className="relative w-full max-w-sm">
            <div className="flex items-center justify-center pb-6">
              <Image width={128} height={128} alt={"logo"} src={"/images/mor-cover-bg.png"} />
            </div>
            <h1 className="text-2xl text-center font-semibold mb-10 text-gray-900">radioter.io</h1>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder="Email"
                  className={`w-full h-12 rounded-lg border px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400 ${
                    emailError
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-300 bg-white focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  }`}
                  value={email}
                  onChange={onEmailChange}
                  disabled={isSubmitting}
                />
                {emailError && <p className="text-sm text-red-600 px-1">{emailError}</p>}
              </div>
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="Password"
                  className={`w-full h-12 rounded-lg border px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400 ${
                    passwordError
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-gray-300 bg-white focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  }`}
                  value={password}
                  onChange={onPasswordChange}
                  disabled={isSubmitting}
                />
                {passwordError && <p className="text-sm text-red-600 px-1">{passwordError}</p>}
                <button
                  type="button"
                  className="text-sm text-gray-600 text-left w-full"
                  onClick={onForgotPasswordClick}
                  disabled={isSubmitting}
                >
                  Forgot password?
                </button>
              </div>
              {serverError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full h-12 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? <InlineSpinner /> : "Sign in"}
              </button>
            </form>
          </div>
        </section>

        {/* Right panel - Descriptive text (hidden on mobile) */}
        <section className="hidden md:flex relative h-screen items-center justify-center p-20 bg-cover bg-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            style={{
              backgroundImage: "url('/images/radio-image.jpg')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
            }}
          ></div>
          <div className="relative text-center text-white">
            <h2 className="text-2xl font-medium">Upload. Mix. Go live.</h2>
          </div>
        </section>
      </div>
    </div>
  );
};
