import React from "react";
import Image from "next/image";

export interface LoginViewProps {
  readonly email: string;
  readonly onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  readonly password: string;
  readonly onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  readonly isSubmitEnabled: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmitClicked: (e: React.FormEvent<HTMLFormElement>) => void;

  readonly onForgotPasswordClicked: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmitClicked,
  isSubmitEnabled,
  isSubmitting,
  onForgotPasswordClicked,
}) => {
  return (
    <div className="w-full">
      <div className="md:grid md:grid-cols-2">
        {/* Left / Top panel */}
        <section className="relative h-screen md:h-screen flex items-start md:items-center justify-center px-6 py-12 md:py-6">
          <div className="absolute inset-0 bg-linear-to-br from-yellow-500 to-pink-500 opacity-15"></div>
          <div className="relative w-full max-w-sm">
            <div className="flex items-center justify-center pb-6">
              <Image width={128} height={128} alt={"logo"} src={"/images/mor-cover-bg.png"} />
            </div>
            <h1 className="text-2xl text-center font-semibold mb-14">radioter.io</h1>
            <form className="space-y-4" onSubmit={onSubmitClicked}>
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border px-4 py-3 outline-none"
                value={email}
                onChange={onEmailChange}
                disabled={isSubmitting}
              />
              <div className="w-full space-y-2">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-xl border px-4 py-3 outline-none"
                  value={password}
                  onChange={onPasswordChange}
                  disabled={isSubmitting}
                />
                <button
                  className="text-sm text-center w-full"
                  onClick={onForgotPasswordClicked}
                  disabled={isSubmitting}
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl border px-4 py-3 font-medium shadow bg-white text-gray-800"
                disabled={!isSubmitEnabled || isSubmitting}
              >
                Sign in
              </button>
            </form>
          </div>
        </section>

        {/* Right / Bottom panel */}
        <section className="relative h-screen md:h-screen flex items-start justify-center p-20 bg-cover bg-center">
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
            <h2 className="text-2xl font-medium">Stream. Mix.</h2>
            <p className="text-xl opacity-70 mt-2">Go live.</p>
          </div>
        </section>
      </div>
    </div>
  );
};
