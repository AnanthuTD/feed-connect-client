export default function validatePassword(password: string): Promise<boolean> {
  // The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=.*[^\s]).{8,}$/;
  
  if (!regex.test(password)) {
    return Promise.resolve(false);
    // return a Promise that resolves to false when the password is invalid
  }
  
  return Promise.resolve(true);
  // return a Promise that resolves to true when the password is valid
}
