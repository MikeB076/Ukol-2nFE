// api/src/util.js
export const ok = (data = {}) => ({ ...data, uuAppErrorMap: {} });
export const badDto = (details) => ({
  uuAppErrorMap: { "api/InvalidDtoIn": details }
});