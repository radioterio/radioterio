"use client";

import { Login } from "./Login";
import React, { useState } from "react";

export const LoginContainer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.length > 0 && password.length > 0;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
