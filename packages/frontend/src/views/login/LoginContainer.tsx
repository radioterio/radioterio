"use client";

import { LoginView } from "./LoginView";

export const LoginContainer: React.FC = () => {
  return (
    <LoginView
      email={""}
      onEmailChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
        throw new Error("Function not implemented.");
      }}
      password={""}
      onPasswordChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
        throw new Error("Function not implemented.");
      }}
      isSubmitEnabled={false}
      isSubmitting={false}
      onSubmitClicked={function (e: React.FormEvent<HTMLFormElement>): void {
        throw new Error("Function not implemented.");
      }}
      onForgotPasswordClicked={function (e: React.MouseEvent<HTMLButtonElement>): void {
        throw new Error("Function not implemented.");
      }}
    />
  );
};
