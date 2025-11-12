export const errorMap = (code, message, paramMap = {}, status = 400) => {
  const e = new Error(message);
  e.status = status;
  e.uuAppErrorMap = { [code]: { message, paramMap } };
  return e;
};