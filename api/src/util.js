// api/src/util.js

// Success wrapper — always append uuAppErrorMap:{}
export const ok = (data = {}) => ({ ...data, uuAppErrorMap: {} });

// Minimal InvalidDtoIn helper for places where you want to return 400 manually
// Prefer using validate(schema) middleware; this is just a convenience
export const badDto = (issues) => ({
  uuAppErrorMap: {
    'api/InvalidDtoIn': {
      message: 'Invalid dtoIn',
      details: Array.isArray(issues)
        ? issues
        : issues && typeof issues === 'object'
          ? issues
          : String(issues)
    }
  }
});