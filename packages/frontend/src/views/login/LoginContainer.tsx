"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { loginAction } from "@/app/actions";
import { Login } from "./Login";

export const LoginContainer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const canSubmit = email.length > 0 && password.length > 0;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await loginAction(email, password);

      switch (res.type) {
        case "right": {
          // TODO: Redirect
          return router.replace("/profile");
        }

        case "left": {
          setIsSubmitting(false);
          // TODO: Draw error
        }
      }
    } catch {
      setIsSubmitting(false);
      // TODO: Draw error
    }
  };

  const onForgotPasswordClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <Login
      email={email}
      onEmailChange={(e) => {
        setEmail(e.target.value);
      }}
      password={password}
      onPasswordChange={(e) => {
        setPassword(e.target.value);
      }}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onForgotPasswordClick={onForgotPasswordClick}
    />
  );
};
