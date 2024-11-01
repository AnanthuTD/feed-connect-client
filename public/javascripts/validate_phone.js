export default function validatePhone(input) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(input);
  }
  