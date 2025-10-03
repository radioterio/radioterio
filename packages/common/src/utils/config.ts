import z from "zod";

export const getEnvValue = <T>(
  env: { [key: string]: string | undefined },
  name: string,
  zodType: z.ZodType<T>,
) => {
  const result = zodType.safeParse(env[name]);
  if (!result.success) {
    throw new Error(
      `Environment variable ${name} value is not compatible with schema ${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
};

export const getEnvStringValue = (
  env: { [key: string]: string | undefined },
  name: string,
  defaultValue?: string,
) => {
  const type = defaultValue !== undefined ? z.string().default(defaultValue) : z.string();

  return getEnvValue(env, name, type);
};

export const getEnvNumberValue = (
  env: { [key: string]: string | undefined },
  name: string,
  defaultValue?: number,
) => {
  const type =
    defaultValue !== undefined ? z.coerce.number().default(defaultValue) : z.coerce.number();

  return getEnvValue(env, name, type);
};

export const getEnvBoolValue = (
  env: { [key: string]: string | undefined },
  name: string,
  defaultValue?: boolean,
) => {
  const type =
    defaultValue !== undefined ? z.coerce.boolean().default(defaultValue) : z.coerce.boolean();

  return getEnvValue(env, name, type);
};
