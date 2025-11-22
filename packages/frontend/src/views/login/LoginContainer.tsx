"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { loginAction } from "@/app/actions";
import { Login } from "./Login";

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const LoginContainer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const validateEmail = (value: string): boolean => {
    if (value.length === 0) {
      setEmailError(null);
      return false;
    }
    if (!isValidEmail(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (value.length === 0) {
      setPasswordError(null);
      return false;
    }
    if (value.length < 1) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const canSubmit =
    email.length > 0 &&
    password.length > 0 &&
    emailError === null &&
    passwordError === null;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setServerError(null);

    // Validate
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await loginAction(email, password);

      switch (res.type) {
        case "right": {
          return router.replace("/profile");
        }

        case "left": {
          setIsSubmitting(false);
          const error = res.left;
          if (error instanceof Error) {
            setServerError(error.message || "Login failed. Please check your credentials.");
          } else {
            setServerError("Login failed. Please check your credentials.");
          }
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) {
      validatePassword(value);
    }
  };

  const onForgotPasswordClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <Login
      email={email}
      onEmailChange={onEmailChange}
      password={password}
      onPasswordChange={onPasswordChange}
      emailError={emailError}
      passwordError={passwordError}
      serverError={serverError}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onForgotPasswordClick={onForgotPasswordClick}
    />
  );
};
