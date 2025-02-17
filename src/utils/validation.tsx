const isValidEmail = (email: string): boolean => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
};

const isValidMinLength = (str: string, len: number): boolean =>
  typeof str === "string" && str.length >= len;

const isValidMaxLength = (str: string, len: number): boolean =>
  typeof str === "string" && str.length <= len;

function getValidator(validationFunc: Function, errorMsg: string) {
  return (_: any, val: any, ...args: any[]): Promise<void> => {
    if (validationFunc(val, ...args)) return Promise.resolve();
    return Promise.reject(errorMsg);
  };
}

const Validations = {
  email: getValidator(isValidEmail, "Email is invalid"),
  min_len: (len: number) => (_: any, str: string) =>
    getValidator(isValidMinLength, `Minimum ${len} characters are required`)(
      undefined,
      str,
      len
    ),
  max_len: (len: number) => (_: any, str: string) =>
    getValidator(isValidMaxLength, `Maximum ${len} characters are allowed`)(
      undefined,
      str,
      len
    ),
  reqd_msg: (field: string) => `${field} is required`,
};

export default Validations;
